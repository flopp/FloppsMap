var hillshadingLayer = null;
var hillshadingLayerShown = false;
var boundariesLayer = null;
var boundariesLayerShown = false;
var npaLayer = null;
var npaLayerShown = false;
var map = null;
var copyrightDiv;
var npaInfoMode = false;
var npaInfoModeClickListener = null;

var theGeolocation = new Geolocation();
var theMarkers = new Markers();
var theLines = new Lines();

var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var MAPTYPE_DEFAULT = "OSM";
var RADIUS_DEFAULT = 0;

var externalLinkTargets = null;

function setupExternalLinkTargets() {
  "use strict";
  var e = new Array();

  e["★ Games ★"] = "";
  e["Confluence.org"] = "http://www.confluence.org/confluence.php?lat=%lat%&lon=%lon%";
  e["Geocaching.com"] = "http://coord.info/map?ll=%lat%,%lon%&z=%zoom%";
  e["Geograph"] = "http://geo.hlipp.de/ommap.php?z=%zoom%&t=g&ll=%lat%,%lon%";
  e["Ingress.com"] = "http://www.ingress.com/intel?latE6=%late6%&lngE6=%lone6%&z=%zoom%";
  e["Lacita.org"] = "http://www.lacita.org/cgi_bin/bf.pl?Path=00&lat=%lat%&lng=%lon%&z=%zoom%";
  e["Munzee (da-fi.de)"] = "http://da-fi.de/public/munzee/bbmap2.php?lat=%lat%&lon=%lon%&zoom=%zoom%";
  e["Nachtcaches.de"] = "http://nachtcaches.de/#%lat%,%lon%,%zoom%";
  e["Opencaching.de"] = "http://www.opencaching.de/map2.php?lat=%lat%&lon=%lon%&zoom=%zoom%";
  e["Waymarking.com"] = "http://www.waymarking.com/wm/search.aspx?f=1&lat=%lat%&lon=%lon%";

  e["★ Maps ★"] = "";
  e["Bing Maps"] = "http://www.bing.com/maps/?v=2&cp=%lat%~%lon%&lvl=%zoom%";
  e["Cloudmade"] = "http://maps.cloudmade.com/?lat=%lat%&lng=%lon%&zoom=%zoom%";
  e["Google Maps"] = "https://maps.google.com/maps?ll=%lat%,%lon%&z=%zoom%";
  e["OpenStreetMap"] = "http://www.openstreetmap.org/?lat=%lat%&lon=%lon%&zoom=%zoom%";
  e["OpenCycleMap"] = "http://www.opencyclemap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%";
  e["ÖPNV-Karte"] = "http://www.öpnvkarte.de/?zoom=%zoom%&lat=%lat%&lon=%lon%";
  e["Wheelmap.org"] = "http://wheelmap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%";
  e["Wikimapia.org"] = "http://wikimapia.org/#lat=%lat%&lon=%lon%&z=%zoom%";
  e["YAPIS"] = "http://yapis.eu/?id=9&lat=%lat%&lon=%lon%&zoom=%zoom%";

  for (var index in e) {
    $('#externallinks').append('<option value="'+index+'">'+index+'</option>');
  }

  externalLinkTargets = e;
}

function gotoExternalLink() {
  var selected = $('#externallinks').find(":selected").text();
  var url = externalLinkTargets[selected];
  if (url == null || url == '') return;

  trackAction('external ' + selected);

  lat = map.getCenter().lat();
  lon = map.getCenter().lng();
  latE6 = Math.round(lat * 1000000);
  lonE6 = Math.round(lon * 1000000);
  lat = lat.toFixed(6);
  lon = lon.toFixed(6);
  zoom = map.getZoom();

  url = url.replace(/%lat%/g, lat);
  url = url.replace(/%lon%/g, lon);
  url = url.replace(/%late6%/g, latE6);
  url = url.replace(/%lone6%/g, lonE6);
  url = url.replace(/%zoom%/g, zoom);

  window.open(url, '_blank');
}

function id2alpha(id) {
  var s = "";
  if (id >= 0 && id < 26) {
    var code = 'A'.charCodeAt() + id;
    s = String.fromCharCode(code);
  }
  return s;
}

function alpha2id(alpha) {
  if (alpha.length != 1) {
    return -1;
  }
  else if (alpha[0] >= 'A' && alpha[0] <= 'Z') {
    return alpha.charCodeAt(0) - 'A'.charCodeAt(0); 
  }
  else if (alpha[0] >= 'a' && alpha[0] <= 'z') {
    return alpha.charCodeAt(0) - 'a'.charCodeAt(0); 
  }
  else {
    return -1;
  }
}

function gotoMarker(id) {
  trackMarker('goto');
  map.setCenter(theMarkers.getById(id).getPosition());
}

function centerMarker(id) {
  trackMarker('center');
  theMarkers.getById(id).setPosition(map.getCenter());
}

function enterEditMode(id) {
  trackMarker('edit');
  var m = theMarkers.getById(id);

  $('#edit_name' + m.getAlpha()).val(m.getName()); 
  $('#edit_coordinates' + m.getAlpha()).val(Coordinates.toString(m.getPosition())); 
  $('#edit_circle' + m.getAlpha()).val(m.getRadius());

  $('#dynview' + id).hide();
  $('#dynedit' + id).show();    
}

function leaveEditMode(id, takenew) {
  if (takenew) {
    var m = theMarkers.getById(id);

    var name = $('#edit_name' + m.getAlpha()).val();
    var name_ok = /^([a-zA-Z0-9-_]*)$/.test(name);

    var s_coordinates = $('#edit_coordinates' + m.getAlpha()).val();
    var coordinates = Coordinates.fromString(s_coordinates);

    var s_radius = $('#edit_circle' + m.getAlpha()).val();
    var radius = getInteger(s_radius, 0, 100000000000);

    var errors = Array();

    if (!name_ok) {
      errors.push(mytrans("sidebar.markers.error_badname").replace(/%1/, name));
    }
    if (coordinates == null) {
      errors.push(mytrans("sidebar.markers.error_badcoordinates").replace(/%1/, s_coordinates));
    }
    if (radius == null) {
      errors.push(mytrans("sidebar.markers.error_badradius").replace(/%1/, s_radius));
    }

    if (errors.length > 0) {
      showAlert(mytrans("dialog.error"), errors.join("<br /><br />"));
    }
    else {
      m.setNamePositionRadius(name, coordinates, radius);
      $('#dynview' + id).show();
      $('#dynedit' + id).hide();
    }
  }
  else
  {
    $('#dynview' + id).show();
    $('#dynedit' + id).hide();
  }
}

function newMarker(coordinates, id, radius, name) {
  if (radius < 0) {
    radius = RADIUS_DEFAULT;
  }

  if (id == -1 || id < 0 || id >= 26 || !theMarkers.getById(id).isFree()) {
    id = theMarkers.getFreeId();
  }
  if (id == -1) {
    showAlert(mytrans("dialog.error"), mytrans("dialog.toomanymarkers_error.content"));
    return null;
  }

  var nextid = theMarkers.getSize();
  for(var i = id+1; i < theMarkers.getSize(); i= i + 1) {
    if (!theMarkers.getById(i).isFree()) {
      nextid = i;
      break;
    }
  }

  var alpha = id2alpha(id);
  if (name === null || name === "") {
    name = "marker_" + alpha;
  }

  var marker = theMarkers.getById(id);
  marker.initialize(name, coordinates, radius);

  var iconw = 32;
  var iconh = 37;
  var offsetx = (id % 7)*iconw;
  var offsety = Math.floor(id / 7)*iconh;


  var div = 
      "<div id=\"dyn" + id + "\">" +
      "<table id=\"dynview" + id + "\" style=\"width: 100%; vertical-align: middle;\">\n" +
      "    <tr>\n" +
      "        <td rowspan=\"3\" style=\"vertical-align: top\">\n" +
      "            <span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/base.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
      "        </td>\n" +
      "        <td style=\"text-align: center\"><i class=\"fa fa-map-marker\"></i></td>\n" +
      "        <td id=\"view_name" + alpha +"\" colspan=\"2\">marker</td>\n" +
      "    </tr>\n" +
      "    <tr>\n" +
      "        <td style=\"text-align: center\"><i class=\"fa fa-globe\"></i></td>\n" +
      "        <td id=\"view_coordinates" + alpha +"\" colspan=\"2\">N 48° 00.123 E 007° 51.456</td>\n" +
      "    </tr>\n" +
      "    <tr>\n" +
      "        <td style=\"text-align: center\"><i class=\"fa fa-circle-o\"></i></td>\n" +
      "        <td id=\"view_circle" + alpha +"\">16100 m</td>\n" +
      "        <td>\n" +
      "            <div class=\"btn-group\" style=\"padding-bottom: 2px; padding-top: 2px; float: right\">\n" +
      "            <button class=\"my-button btn btn-mini btn-warning\" data-i18n=\"[title]sidebar.markers.edit_marker\" type=\"button\"  onclick=\"enterEditMode(" + id + ");\"><i class=\"fa fa-edit\"></i></button>\n" +
      "            <button class=\"my-button btn btn-mini btn-danger\" data-i18n=\"[title]sidebar.markers.delete_marker\" type=\"button\" onClick=\"theMarkers.removeById(" + id + ")\"><i class=\"fa fa-trash-o\"></i></button>\n" +
      "            <button class=\"my-button btn btn-mini btn-info\" data-i18n=\"[title]sidebar.markers.move_to\" type=\"button\" onClick=\"gotoMarker(" + id + ")\"><i class=\"fa fa-search\"></i></button>\n" +
      "            <button class=\"my-button btn btn-mini btn-warning\" data-i18n=\"[title]sidebar.markers.center\" type=\"button\" onClick=\"centerMarker(" + id + ")\"><i class=\"fa fa-crosshairs\"></i></button>\n" +
      "            <button class=\"my-button btn btn-mini btn-success\" data-i18n=\"[title]sidebar.markers.project\" type=\"button\" onClick=\"projectFromMarker(" + id + ")\"><i class=\"fa fa-location-arrow\"></i></button>\n" +
      "            </div>\n" +
      "        </td>\n" +
      "    </tr>\n" +
      "</table>\n" +
      "<table id=\"dynedit" + id + "\" style=\"display: none; width: 100%; vertical-align: middle;\">\n" +
      "    <tr>\n" +
      "        <td rowspan=\"4\" style=\"vertical-align: top\"><span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/base.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
      "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-map-marker\"></i></td>\n" +
      "        <td><input id=\"edit_name" + alpha + "\" data-i18n=\"[title]sidebar.markers.name;[placeholder]sidebar.markers.name_placeholder\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
      "    </tr>\n" +
      "    <tr>\n" +
      "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-globe\"></i></td>\n" +
      "        <td><input id=\"edit_coordinates" + alpha +"\" data-i18n=\"[title]sidebar.markers.coordinates;[placeholder]sidebar.markers.coordinates_placeholder\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
      "    </tr>\n" +
      "    <tr>\n" +
      "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-circle-blank\"></i></td>\n" +
      "        <td><input id=\"edit_circle" + alpha +"\" data-i18n=\"[title]sidebar.markers.radius;[placeholder]sidebar.markers.radius_placeholder\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
      "    </tr>\n" +
      "    <tr>\n" +
      "        <td colspan=\"2\" style=\"text-align: right\">\n" +
      "            <button class=\"btn btn-small btn-primary\" type=\"button\" onclick=\"javascript: leaveEditMode(" + id + ", true);\" data-i18n=\"dialog.ok\">OK</button>\n" +
      "            <button class=\"btn btn-small\" type=\"button\" onclick=\"leaveEditMode(" + id + ", false);\" data-i18n=\"dialog.cancel\">CANCEL</button>\n" +
      "        </td>\n" +
      "    </tr>\n" +
      "</table>" +
      "</div>";


  if (nextid == theMarkers.getSize()) {
    $('#dynMarkerDiv').append(div);
  }
  else {
    $(div).insertBefore('#dyn' + nextid);
  }

  $('#edit_name' + alpha).keydown(function(e) {
    if (e.which == 27) { leaveEditMode(id, false); }
    else if (e.which == 13) { leaveEditMode(id, true); }
  });

  $('#edit_coordinates' + alpha).keydown(function(e) {
    if (e.which == 27) { leaveEditMode(id, false); }
    else if (e.which == 13) { leaveEditMode(id, true); }
  });

  $('#edit_circle' + alpha).keydown(function(e) {
    if (e.which == 27) { leaveEditMode(id, false); }
    else if (e.which == 13) { leaveEditMode(id, true); }
  });

  $('#btnmarkers2').show();
  $('#btnmarkersdelete1').removeAttr('disabled');
  $('#btnmarkersdelete2').removeAttr('disabled');

  marker.update();
  theMarkers.saveMarkersList();
  theLines.updateLinesMarkerAdded(id);

  return marker;
}

function projectFromMarker(id) {
  trackMarker('project');

  var mm = theMarkers.getById(id);
  var oldpos = mm.getPosition();

  showProjectionDialog(
    function(data1, data2) {
      var angle = getFloat(data1, 0, 360);
      var dist = getFloat(data2, 0, 100000000000);

      if (angle == null) {
        showAlert(mytrans("dialog.error"), mytrans("dialog.projection.error_bad_bearing").replace(/%1/, data1));
        return;
      }

      if (dist == null) {
        showAlert(mytrans("dialog.error"), mytrans("dialog.projection.error_bad_distance").replace(/%1/, data2));
        return;
      }

      var newpos = Coordinates.projection_geodesic(oldpos, angle, dist);
      var m = newMarker(newpos, -1, RADIUS_DEFAULT, null);
      if (m != null) {
        showAlert(mytrans("dialog.information"), mytrans("dialog.projection.msg_new_marker").replace(/%1/, m.getAlpha()));
      }        
    }
 );
}

function storeCenter() {
  c = map.getCenter();
  $.cookie('clat', c.lat(), {expires:30});
  $.cookie('clon', c.lng(), {expires:30});
}


function storeZoom() {
  $.cookie('zoom', map.getZoom(), {expires:30});
}

function requestNPAInfo(lat, lng) {
    var url = 
        'http://geodienste.bfn.de/ogc/wms/schutzgebiet?REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.3.0&CRS=CRS:84' +
        '&BBOX=' + lng + ',' + lat + ',' + (lng+0.001) + ',' + (lat+0.001) +
        '&WIDTH=256&HEIGHT=256&INFO_FORMAT=application/geojson&FEATURE_COUNT=1&QUERY_LAYERS=Naturschutzgebiete&X=0&Y=0';
    $.ajax({
        url: url, 
        crossOrigin: true,
        proxy: 'proxy.php'
    }).done(function(data) {
        var obj = $.parseJSON(data);
        if (obj && obj.features && obj.features.length > 0) {
            var contentString = 
                '<b>' + obj.features[0].properties.NAME + '</b><br/>' + 
                mytrans("dialog.npa.cdda_code") + ' ' + obj.features[0].properties.CDDA_CODE + '<br />' +
                mytrans("dialog.npa.since") + ' ' + obj.features[0].properties.JAHR + '<br />' +
                mytrans("dialog.npa.area") + ' ' + obj.features[0].properties.FLAECHE + ' ha<br />';
            var infowindow = new google.maps.InfoWindow( { content: contentString, position: new google.maps.LatLng(lat, lng) } );
            infowindow.open(map);
        } else {
            showAlert(mytrans("dialog.information"), mytrans("dialog.npa.msg_no_npa"));
        }
    }).fail(function() {
        showAlert(mytrans("dialog.error"), mytrans("dialog.npa.error"));
    });
}

function startNPAInfoMode() {
    if (npaInfoMode) return;
    
    map.setOptions({draggableCursor: 'crosshair'});
    npaInfoMode = true;
    npaInfoModeClickListener = google.maps.event.addListener(map, 'click', function(event) {  
        requestNPAInfo(event.latLng.lat(), event.latLng.lng());
        endNPAInfoMode();
    });
}


function endNPAInfoMode() {
    if (!npaInfoMode) return;
    
    map.setOptions({draggableCursor: ''});
    npaInfoMode = false;
    google.maps.event.removeListener(npaInfoModeClickListener);
}

function getFeaturesString() {
    var s = "";
    if ($('#boundaries').is(':checked')) { s += "b"; }
    if ($('#showCaches').is(':checked')) { s += "g"; }
    if ($('#hillshading').is(':checked')) { s += "h"; }
    if ($('#npa').is(':checked')) { s += "n"; }
    return s;
}

function getPermalink() {
  var lat = map.getCenter().lat();
  var lng = map.getCenter().lng();
  var latE6 = Math.round(lat * 1000000);
  var lngE6 = Math.round(lng * 1000000);
  var zoom = map.getZoom();

  var link = "http://flopp.net/?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) 
  + "&z=" + zoom 
  + "&t=" + map.getMapTypeId()
  + "&f=" + getFeaturesString()
  + "&m=" + theMarkers.toString() 
  + "&d=" + theLines.getLinesText();

  return link;
}

function generatePermalink() {
  var link = getPermalink();
  showLinkDialog(link);
}

function updateCopyrights() {
  if (copyrightDiv == null) {
    return;
  }

  newMapType = map.getMapTypeId();
  $.cookie('maptype', newMapType, {expires:30});

  if (newMapType == "OSM" || newMapType == "OSM/DE") {
    copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>";
  } else if (newMapType == "OCM") {
    copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://opencyclemap.org\">OpenCycleMap.org</a>";
  } else if (newMapType == "MQ") {
    copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://mapquest.com\">MapQuest</a>";
  } else if (newMapType == "OUTD") {
    copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://www.thunderforest.com/outdoors/\">Thunderforest</a>";
  } else {
    copyrightDiv.innerHTML = "";
  }
}

function repairLat(x, d) {
  if (x == null || x == NaN || x < -90 || x > +90) {
    return d;
  } else {
    return x;
  }
}

function repairLon(x, d) {
  if (x == null || x == NaN || x < -180 || x > +180) {
    return d;
  } else {
    return x;
  }
}

function repairRadius(x, d) {
  if (x == null || x == NaN || x < 0 || x > 100000000) {
    return d;
  } else {
    return x;
  }
}

function repairZoom(x, d) {
  if (x == null || x == NaN || x < 1 || x > 20) {
    return d;
  } else {
    return x;
  }
}

function repairMaptype(t, d) {
  if (t == "OSM" || t == "OSM/DE" || t == "OCM") {
    return t;
  } else if (t == "MQ") {
    return t;
  } else if (t == "OUTD") {
    return t;
  } else if (t == "satellite" || t == "hybrid" || t == "roadmap" || t == "terrain") {
    return t;
  } else {
    return d;
  }
}

function tileUrl(template, servers, coord, zoom) {
  var limit = Math.pow(2, zoom);
  var x = ((coord.x % limit) + limit) % limit;
  var y = coord.y;
  var s = servers[(Math.abs(x + y)) % servers.length];
  return template.replace(/%s/, s).replace(/%x/, x).replace(/%y/, y).replace(/%z/, zoom);
}

function initialize(xcenter, xzoom, xmap, xfeatures, xmarkers, xlines) {
  var center = null;
  var atDefaultCenter = false;
  var zoom = parseInt(xzoom);
  var maptype = xmap;

  // parse markers 
  var markerdata = new Array();
  var markercenter = null;
  {
    var count = 0;
    var clat = 0;
    var clon = 0;

    // ID:COODS:R(:NAME)?|ID:COORDS:R(:NAME)?
    // COORDS=LAT:LON or DEG or DMMM
    var data;
    if (xmarkers.indexOf("*") != -1)
    {
      data = xmarkers.split('*');
    }
    else /*if (xmarkers.indexOf("|") != -1)*/
    {
      data = xmarkers.split('|');
    }

    for(var i = 0; i != data.length; ++i)
    {
      var data2 = data[i].split(':');

      if (data2.length < 3 || data2.length > 5) continue;

      var m = new Object();

      m.alpha = data2[0];
      m.id = alpha2id(m.alpha);
      if (m.id == -1) continue;

      m.name = null;

      var index = 1;

      var lat = parseFloat(data2[index]);
      var lon = parseFloat(data2[index+1]);
      if (lat != null && lon != null && -90 <= lat && lat <= 90 && -180 <= lon && lon <= 180)
      {
        index = index + 2;
        m.coords = new google.maps.LatLng(lat, lon);
      }
      else
      {
        m.coords = Coordinates.fromString(data2[index]); 
        if (m.coords == null) continue;

        index = index + 1;
      }            

      var circle = parseFloat(data2[index]);
      if (circle < 0 || circle > 100000000000) continue;
      m.r = circle;
      index = index + 1;

      if (index < data2.length)
      {
        if (/^([a-zA-Z0-9-_]*)$/.test(data2[index]))
        {
          m.name = data2[index];
        }
      }

      count += 1;
      clat += m.coords.lat();
      clon += m.coords.lng();

      markerdata.push(m);
    }

    if (count != 0) {
      markercenter = new google.maps.LatLng(clat/count, clon/count);
    }
  }

  var loadfromcookies = false;

  if (xcenter != null && xcenter != '') {
    var data = xcenter.split(':');

    if (data.length == 1) {
      center = Coordinates.fromString(xcenter); 
    }
    else {
      var lat = parseFloat(data[0]);
      var lon = parseFloat(data[1]);

      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180)
      {
        center = new google.maps.LatLng(lat, lon);
      }
    }
  }
  else if (markercenter != null) {
    center = markercenter;
  }
  else {
    loadfromcookies = true;

    /* try to read coordinats from cookie */
    clat = get_cookie_float('clat', CLAT_DEFAULT);
    clon = get_cookie_float('clon', CLON_DEFAULT);
    if (clat == CLAT_DEFAULT && clon == CLON_DEFAULT) {
      atDefaultCenter = true;
    }
    
    clat = repairLat(clat, CLAT_DEFAULT);
    clon = repairLon(clon, CLON_DEFAULT);
    center = new google.maps.LatLng(clat, clon);

    zoom = get_cookie_int('zoom', ZOOM_DEFAULT);
    maptype = get_cookie_string('maptype', MAPTYPE_DEFAULT);
  }

  if (center == null) {
    center = new google.maps.LatLng(CLAT_DEFAULT, CLON_DEFAULT);
    atDefaultCenter = true;
  }

  zoom = repairZoom(zoom, ZOOM_DEFAULT);
  maptype = repairMaptype(maptype, MAPTYPE_DEFAULT);

  var myOptions = {
    zoom: zoom,
    center: center,
    scaleControl: true,
    mapTypeControlOptions: { mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'MQ', 'OUTD', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN] },
    mapTypeId: google.maps.MapTypeId.ROADMAP };

  map = new google.maps.Map(document.getElementById("themap"), myOptions);

  osm_type = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      return tileUrl("http://%s.tile.openstreetmap.org/%z/%x/%y.png", ["a","b","c"], coord, zoom);
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OSM",
    alt: "OpenStreetMap",
    maxZoom: 18 });
  osmde_type = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      return tileUrl("http://%s.tile.openstreetmap.de/tiles/osmde/%z/%x/%y.png", ["a","b","c"], coord, zoom);
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OSM/DE",
    alt: "OpenStreetMap (german style)",
    maxZoom: 18 });
  ocm_type = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      return tileUrl("http://%s.tile.opencyclemap.org/cycle/%z/%x/%y.png", ["a","b","c"], coord, zoom);
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OCM",
    alt: "OpenCycleMap",
    maxZoom: 17 });
  mq_type = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      return tileUrl("http://otile%s.mqcdn.com/tiles/1.0.0/osm/%z/%x/%y.png", ["1","2","3","4"], coord, zoom);
    },
    tileSize: new google.maps.Size(256, 256),
    name: "MQ",
    alt: "MapQuest (OSM)",
    maxZoom: 18 });
  outdoors_type = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      return tileUrl("http://%s.tile.thunderforest.com/outdoors/%z/%x/%y.png", ["a","b","c"], coord, zoom);
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OUTD",
    alt: "Thunderforest Outdoors",
    maxZoom: 18 });

  map.mapTypes.set("OSM", osm_type);
  map.mapTypes.set("OSM/DE", osmde_type);
  map.mapTypes.set("OCM", ocm_type);
  map.mapTypes.set("MQ", mq_type);
  map.mapTypes.set("OUTD", outdoors_type);

  map.setMapTypeId(maptype);

  hillshadingLayer = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      if (6 <= zoom && zoom <= 16) 
      {
        return tileUrl("http://korona.geog.uni-heidelberg.de/tiles/asterh/?x=%x&y=%y&z=%z", ["dummy"], coord, zoom);
      }
      else 
      { 
        return null; 
      } 
    },
    tileSize: new google.maps.Size(256, 256),
    name: "hill",
    alt: "Hillshading",
    maxZoom: 16 });

  boundariesLayer = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) { 
      if (6 <= zoom && zoom <= 16) 
      {
        return tileUrl("http://korona.geog.uni-heidelberg.de/tiles/adminb/?x=%x&y=%y&z=%z", ["dummy"], coord, zoom);
      }
      else 
      { 
        return null; 
      } 
    },
    tileSize: new google.maps.Size(256, 256),
    name: "adminb",
    alt: "Administrative Boundaries",
    maxZoom: 16 });
  
  npaLayer = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var proj = map.getProjection();
      var tileSize = 256;
      var zfactor = tileSize / Math.pow(2, zoom);
      var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * zfactor, coord.y * zfactor));
      var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * zfactor, (coord.y + 1) * zfactor));
      var bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat();
      var url = "http://geodienste.bfn.de/ogc/wms/schutzgebiet?";
      url += "&REQUEST=GetMap";
      url += "&SERVICE=WMS";
      url += "&VERSION=1.3.0";
      url += "&LAYERS=Naturschutzgebiete";
      url += "&FORMAT=image/png";
      url += "&BGCOLOR=0xFFFFFF";
      url += "&STYLES=default";
      url += "&TRANSPARENT=TRUE";
      url += "&CRS=CRS:84";
      url += "&BBOX=" + bbox;
      url += "&WIDTH=" + tileSize;
      url += "&HEIGHT=" + tileSize;
      return url;
    },
    tileSize: new google.maps.Size(256, 256),
    isPng: true,
    opacity: 0.6 });
  
  // Create div for showing copyrights.
  copyrightDiv = document.createElement("div");
  copyrightDiv.id = "map-copyright";
  copyrightDiv.style.fontSize = "11px";
  copyrightDiv.style.fontFamily = "Arial, sans-serif";
  copyrightDiv.style.margin = "0 2px 2px 0";
  copyrightDiv.style.whiteSpace = "nowrap";
  copyrightDiv.style.background = "#FFFFFF";
  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(copyrightDiv);    

  map.setCenter(center, zoom);

  google.maps.event.addListener(map, "center_changed", function() { storeZoom(); storeCenter(); okapi_schedule_load_caches(); });
  google.maps.event.addListener(map, "zoom_changed", function() { storeZoom(); storeCenter(); okapi_schedule_load_caches(); });
  google.maps.event.addListener(map, "maptypeid_changed", function(){ updateCopyrights()});    

  if (loadfromcookies) {
    raw_ids = $.cookie('markers');
    if (raw_ids != undefined) {
      ids = raw_ids.split(':');
      for(var i = 0; i != ids.length; ++i) {
        var id = parseInt(ids[i]);
        if (id == null || id < 0 || id >=26) continue;

        var raw_data = $.cookie('marker' + id);
        if (raw_data == undefined) continue;

        var data = raw_data.split(':')
        if (data.length != 3 && data.length != 4) continue;

        var lat = parseFloat(data[0]);
        if (lat < -90 || lat > 90) continue;
        var lon = parseFloat(data[1]);
        if (lon < -180 || lon > 180) continue; 
        var r = parseFloat(data[2]);
        if (r < 0 || r > 100000000000) continue; 

        var name = null;

        if (data.length == 4) {
          if (/^([a-zA-Z0-9-_]*)$/.test(data[3]))
          {
            name = data[3];
          }
        }

        newMarker(new google.maps.LatLng(lat, lon), id, r, name);
      }
    }

    var raw_lines = $.cookie('lines');
    if (raw_lines != undefined) {
      var linesarray = raw_lines.split('*');
      for(var i = 0; i < linesarray.length; ++i) {
        var line = linesarray[i].split(':');
        if (line.length != 2) continue;

        var id1 = alpha2id(line[0]);
        if (id1 != -1 && theMarkers.getById(id1).isFree()) {
          id1 = -1;
        }
        var id2 = alpha2id(line[1]);
        if (id2 != -1 && theMarkers.getById(id2).isFree()) {
          id2 = -1;
        }

        theLines.newLine(id1, id2);
      }
    }
  } else {
    for(var i = 0; i < markerdata.length; ++i) {
      newMarker(markerdata[i].coords, markerdata[i].id, markerdata[i].r, markerdata[i].name);
    }

    var raw_lines = xlines;
    if (raw_lines != null) {
      /* be backwards compatible */
      if (raw_lines.length == 3 
         && raw_lines[0] >= 'A' && raw_lines[0] <= 'Z' 
         && raw_lines[1] == '*' 
         && raw_lines[2] >= 'A' && raw_lines[2] <= 'Z') {
        raw_lines = raw_lines[0] + ':' + raw_lines[2];
      }

      var linesarray = raw_lines.split('*');
      for(var i = 0; i < linesarray.length; ++i) {
        var line = linesarray[i].split(':');
        if (line.length != 2) continue;

        var id1 = alpha2id(line[0]);
        if (id1 != -1 && theMarkers.getById(id1).isFree()) {
          id1 = -1;
        }
        var id2 = alpha2id(line[1]);
        if (id2 != -1 && theMarkers.getById(id2).isFree()) {
          id2 = -1;
        }

        theLines.newLine(id1, id2);  
      }
    }
  }

  updateCopyrights();

  restoreSidebar(true);
  if (xfeatures == '[default]') {
    restoreHillshading(true);
    restoreBoundaries(false);
    restoreGeocaches(false);
    toggleNPALayer(false);
  } else {
    toggleHillshading(xfeatures.indexOf('h') >= 0 || xfeatures.indexOf('H') >= 0);
    toggleBoundaries(xfeatures.indexOf('b') >= 0 || xfeatures.indexOf('B') >= 0);
    okapi_toggle_load_caches(xfeatures.indexOf('g') >= 0 || xfeatures.indexOf('G') >= 0);
    toggleNPALayer(xfeatures.indexOf('n') >= 0 || xfeatures.indexOf('N') >= 0);
  }
  restoreCoordinatesFormat(0);

  setupExternalLinkTargets();
  
  if (atDefaultCenter) {
    theGeolocation.whereAmI();
  }
}
