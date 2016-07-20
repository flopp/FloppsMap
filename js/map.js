/*jslint
  indent: 4
*/

/*global
  $, google, Lines, Markers, Conversion, Cookies, Coordinates, trackMarker, mytrans, showAlert,
  id2alpha, alpha2id,
  showProjectionDialog, showLinkDialog,
  osmProvider, osmDeProvider, ocmProvider, thunderforestOutdoorsProvider, opentopomapProvider,
  get_cookie_int, get_cookie_float, get_cookie_string,
  Sidebar, ExternalLinks, Hillshading, Geolocation, NPA, CDDA, Freifunk, Okapi,
  restoreCoordinatesFormat,
  document, setTimeout
*/

//var boundariesLayer = null;
//var boundariesLayerShown = false;
var map = null;
var copyrightDiv = null;
var theMarkers = new Markers();

var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var MAPTYPE_DEFAULT = "OSM";
var RADIUS_DEFAULT = 0;


function enterEditMode(id) {
    'use strict';

    trackMarker('edit');
    var m = theMarkers.getById(id);

    $('#dyn' + id + ' > .markeredit .edit_name').val(m.getName());
    $('#edit_coordinates' + m.getAlpha()).val(Coordinates.toString(m.getPosition()));
    $('#edit_circle' + m.getAlpha()).val(m.getRadius());

    $('#dyn' + id + ' > .markerview').hide();
    $('#dyn' + id + ' > .markeredit').show();
}


function leaveEditMode(id, takenew) {
    'use strict';

    if (takenew) {
        var m = theMarkers.getById(id),
            name = $('#dyn' + id + ' > .markeredit .edit_name').val(),
            name_ok = /^([a-zA-Z0-9-_]*)$/.test(name),
            s_coordinates = $('#edit_coordinates' + m.getAlpha()).val(),
            coordinates = Coordinates.fromString(s_coordinates),
            s_radius = $('#edit_circle' + m.getAlpha()).val(),
            radius = Conversion.getInteger(s_radius, 0, 100000000000),
            errors = [];

        if (!name_ok) {
            errors.push(mytrans("sidebar.markers.error_badname").replace(/%1/, name));
        }
        if (!coordinates) {
            errors.push(mytrans("sidebar.markers.error_badcoordinates").replace(/%1/, s_coordinates));
        }
        if (radius === null) {
            errors.push(mytrans("sidebar.markers.error_badradius").replace(/%1/, s_radius));
        }

        if (errors.length > 0) {
            showAlert(mytrans("dialog.error"), errors.join("<br /><br />"));
        } else {
            m.setNamePositionRadius(name, coordinates, radius);
            $('#dyn' + id + ' > .markerview').show();
            $('#dyn' + id + ' > .markeredit').hide();
        }
    } else {
        $('#dyn' + id + ' > .markerview').show();
        $('#dyn' + id + ' > .markeredit').hide();
    }
}


function createMarkerDiv(id) {
    'use strict';

    var alpha = id2alpha(id),
        iconw = 33,
        iconh = 37,
        offsetx = (id % 26) * iconw,
        offsety = Math.floor(id / 26) * iconh;

    return "<div id=\"dyn" + id + "\">" +
        //"<table id=\"dynview" + id + "\" style=\"width: 100%; vertical-align: middle;\">\n" +
        "<table class=\"markerview\" style=\"width: 100%; vertical-align: middle;\">\n" +
        "    <tr>\n" +
        "        <td rowspan=\"3\" style=\"vertical-align: top\">\n" +
        "            <span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/markers.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
        "        </td>\n" +
        "        <td style=\"text-align: center\"><i class=\"fa fa-map-marker\"></i></td>\n" +
        "        <td id=\"view_name" + alpha + "\" colspan=\"2\">marker</td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center\"><i class=\"fa fa-globe\"></i></td>\n" +
        "        <td id=\"view_coordinates" + alpha + "\" colspan=\"2\">N 48° 00.123 E 007° 51.456</td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center\"><i class=\"fa fa-circle-o\"></i></td>\n" +
        "        <td id=\"view_circle" + alpha + "\">16100 m</td>\n" +
        "        <td>\n" +
        "            <div class=\"btn-group\" style=\"padding-bottom: 2px; padding-top: 2px; float: right\">\n" +
        "            <button class=\"my-button btn btn-mini btn-warning\" data-i18n=\"[title]sidebar.markers.edit_marker\" type=\"button\"  onclick=\"enterEditMode(" + id + ");\"><i class=\"fa fa-edit\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-danger\" data-i18n=\"[title]sidebar.markers.delete_marker\" type=\"button\" onClick=\"theMarkers.removeById(" + id + ")\"><i class=\"fa fa-trash-o\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-info\" data-i18n=\"[title]sidebar.markers.move_to\" type=\"button\" onClick=\"theMarkers.goto(" + id + ")\"><i class=\"fa fa-search\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-warning\" data-i18n=\"[title]sidebar.markers.center\" type=\"button\" onClick=\"theMarkers.center(" + id + ")\"><i class=\"fa fa-crosshairs\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-success\" data-i18n=\"[title]sidebar.markers.project\" type=\"button\" onClick=\"projectFromMarker(" + id + ")\"><i class=\"fa fa-location-arrow\"></i></button>\n" +
        "            </div>\n" +
        "        </td>\n" +
        "    </tr>\n" +
        "</table>\n" +
        "<table class=\"markeredit\" style=\"display: none; width: 100%; vertical-align: middle;\">\n" +
        "    <tr>\n" +
        "        <td rowspan=\"4\" style=\"vertical-align: top\"><span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/markers.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
        "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-map-marker\"></i></td>\n" +
        "        <td><input data-i18n=\"[title]sidebar.markers.name;[placeholder]sidebar.markers.name_placeholder\" class=\"edit_name form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-globe\"></i></td>\n" +
        "        <td><input id=\"edit_coordinates" + alpha + "\" data-i18n=\"[title]sidebar.markers.coordinates;[placeholder]sidebar.markers.coordinates_placeholder\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-circle-blank\"></i></td>\n" +
        "        <td><input id=\"edit_circle" + alpha + "\" data-i18n=\"[title]sidebar.markers.radius;[placeholder]sidebar.markers.radius_placeholder\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td colspan=\"2\" style=\"text-align: right\">\n" +
        "            <button class=\"btn btn-small btn-primary\" type=\"button\" onclick=\"javascript: leaveEditMode(" + id + ", true);\" data-i18n=\"dialog.ok\">OK</button>\n" +
        "            <button class=\"btn btn-small\" type=\"button\" onclick=\"leaveEditMode(" + id + ", false);\" data-i18n=\"dialog.cancel\">CANCEL</button>\n" +
        "        </td>\n" +
        "    </tr>\n" +
        "</table>" +
        "</div>";
}


function newMarker(coordinates, id, radius, name) {
    'use strict';

    if (radius < 0) {
        radius = RADIUS_DEFAULT;
    }

    if (id < 0 || id >= theMarkers.getSize() || !theMarkers.getById(id).isFree()) {
        id = theMarkers.getFreeId();
    }
    if (id < 0) {
        showAlert(
            mytrans("dialog.error"),
            mytrans("dialog.toomanymarkers_error.content").replace(/%1/, theMarkers.getSize())
        );
        return null;
    }

    var alpha = id2alpha(id),
        marker,
        div,
        nextid;

    if (!name || name === "") {
        name = "marker_" + alpha;
    }

    marker = theMarkers.getById(id);
    marker.initialize(map, name, coordinates, radius);
    div = createMarkerDiv(id);

    nextid = theMarkers.getNextUsedId(id);
    if (nextid < 0) {
        $('#dynMarkerDiv').append(div);
    } else {
        $(div).insertBefore('#dyn' + nextid);
    }

    $('#dyn' + id + ' > .markeredit .edit_name').keydown(function (e) {
        if (e.which === 27) {
            leaveEditMode(id, false);
        } else if (e.which === 13) {
            leaveEditMode(id, true);
        }
    });

    $('#edit_coordinates' + alpha).keydown(function (e) {
        if (e.which === 27) {
            leaveEditMode(id, false);
        } else if (e.which === 13) {
            leaveEditMode(id, true);
        }
    });

    $('#edit_circle' + alpha).keydown(function (e) {
        if (e.which === 27) {
            leaveEditMode(id, false);
        } else if (e.which === 13) {
            leaveEditMode(id, true);
        }
    });

    $('#btnmarkers2').show();
    $('#btnmarkersdelete1').removeAttr('disabled');
    $('#btnmarkersdelete2').removeAttr('disabled');

    marker.update();
    theMarkers.saveMarkersList();
    Lines.updateLinesMarkerAdded();

    return marker;
}


function projectFromMarker(id) {
    'use strict';

    trackMarker('project');

    var mm = theMarkers.getById(id),
        oldpos = mm.getPosition();

    showProjectionDialog(
        function (data1, data2) {
            var angle = Conversion.getFloat(data1, 0, 360),
                dist = Conversion.getFloat(data2, 0, 100000000000),
                newpos,
                newmarker;

            if (angle === null) {
                showAlert(
                    mytrans("dialog.error"),
                    mytrans("dialog.projection.error_bad_bearing").replace(/%1/, data1)
                );
                return;
            }

            if (dist === null) {
                showAlert(
                    mytrans("dialog.error"),
                    mytrans("dialog.projection.error_bad_distance").replace(/%1/, data2)
                );
                return;
            }

            newpos = Coordinates.projection_geodesic(oldpos, angle, dist);
            newmarker = newMarker(newpos, -1, RADIUS_DEFAULT, null);
            if (newmarker) {
                showAlert(
                    mytrans("dialog.information"),
                    mytrans("dialog.projection.msg_new_marker").replace(/%1/, newmarker.getAlpha())
                );
            }
        }
    );
}


function storeCenter() {
    'use strict';

    var c = map.getCenter();
    Cookies.set('clat', c.lat(), {expires: 30});
    Cookies.set('clon', c.lng(), {expires: 30});
}


function storeZoom() {
    'use strict';

    Cookies.set('zoom', map.getZoom(), {expires: 30});
}


function getFeaturesString() {
    'use strict';

    var s = "";
    //if ($('#boundaries').is(':checked')) { s += "b"; }
    if ($('#geocaches').is(':checked')) { s += "g"; }
    if ($('#hillshading').is(':checked')) { s += "h"; }
    if ($('#npa').is(':checked')) { s += "n"; }
    if ($('#freifunk').is(':checked')) { s += "f"; }

    return s;
}


function getPermalink() {
    'use strict';

    var lat = map.getCenter().lat(),
        lng = map.getCenter().lng();

    return "http://flopp.net/" +
        "?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) +
        "&z=" + map.getZoom() +
        "&t=" + map.getMapTypeId() +
        "&f=" + getFeaturesString() +
        "&m=" + theMarkers.toString() +
        "&d=" + Lines.getLinesText();
}

function generatePermalink() {
    'use strict';

    var link = getPermalink();
    showLinkDialog(link);
}


function updateCopyrights() {
    'use strict';

    var newMapType = map.getMapTypeId(),
        isGoogleMap = true,
        copyright = "";

    Cookies.set('maptype', newMapType, {expires: 30});

    if (newMapType === "OSM" || newMapType === "OSM/DE") {
        isGoogleMap = false;
        copyright = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>";
    } else if (newMapType === "OCM") {
        isGoogleMap = false;
        copyright = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://opencyclemap.org\">OpenCycleMap.org</a>";
    } else if (newMapType === "OUTD") {
        isGoogleMap = false;
        copyright = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://www.thunderforest.com/outdoors/\">Thunderforest</a>";
    } else if (newMapType === "TOPO") {
        isGoogleMap = false;
        copyright = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, height data by SRTM, tiles (C) by <a href=\"http://www.opentopomap.org/\">OpenTopoMap</a>";
    }

    if (copyrightDiv) {
        copyrightDiv.innerHTML = copyright;
    }

    if (isGoogleMap) {
        $(".gmnoprint a, .gmnoprint span, .gm-style-cc").css("display", "block");
        $("a[href*='maps.google.com/maps']").show();
        map.setOptions({streetViewControl: true});
    } else {
        // hide logo for non-g-maps
        $("a[href*='maps.google.com/maps']").hide();
        // hide term-of-use for non-g-maps
        $(".gmnoprint a, .gmnoprint span, .gm-style-cc").css("display", "none");
        map.setOptions({streetViewControl: false});
    }
}


function repairLat(x, d) {
    'use strict';

    if (Coordinates.validLat(x)) {
        return x;
    }

    return d;
}


function repairLon(x, d) {
    'use strict';

    if (Coordinates.validLng(x)) {
        return x;
    }

    return d;
}


function repairRadius(x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 0 || x > 100000000) {
        return d;
    }

    return x;
}


function repairZoom(x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 1 || x > 20) {
        return d;
    }

    return x;
}


function repairMaptype(t, d) {
    'use strict';

    if (t ===  "OSM" || t ===  "OSM/DE" || t ===  "OCM" || t ===  "OUTD" || t ===  "TOPO" ||
            t ===  "satellite" || t ===  "hybrid" || t ===  "roadmap" || t ===  "terrain") {
        return t;
    }

    return d;
}


function parseMarkersFromUrl(urlarg) {
    'use strict';

    if (urlarg === null) {
        return [];
    }

    var markers = [],
        data;

    // ID:COODRS:R(:NAME)?|ID:COORDS:R(:NAME)?
    // COORDS=LAT:LON or DEG or DMMM
    if (urlarg.indexOf("*") >= 0) {
        data = urlarg.split('*');
    } else {
        /* sep is '|' */
        data = urlarg.split('|');
    }

    data.map(function (dataitem) {
        dataitem = dataitem.split(':');
        if (dataitem.length < 3 || dataitem.length > 5) {
            return;
        }

        var m = {
                alpha: dataitem[0],
                id: alpha2id(dataitem[0]),
                name: null,
                coords: null,
                r: 0
            },
            index = 1,
            lat,
            lon;

        if (m.id < 0) {
            return;
        }

        lat = parseFloat(dataitem[index]);
        lon = parseFloat(dataitem[index + 1]);
        if (Coordinates.valid(lat, lon)) {
            index += 2;
            m.coords = new google.maps.LatLng(lat, lon);
        } else {
            m.coords = Coordinates.fromString(dataitem[index]);
            index += 1;
        }
        if (!m.coords) {
            return;
        }

        m.r = repairRadius(parseFloat(dataitem[index]), 0);
        index = index + 1;

        if (index < dataitem.length &&
                /^([a-zA-Z0-9-_]*)$/.test(dataitem[index])) {
            m.name = dataitem[index];
        }

        markers.push(m);
    });

    return markers;
}


function parseCenterFromUrl(urlarg) {
    'use strict';

    if (urlarg === null) {
        return null;
    }

    var data = urlarg.split(':'),
        lat,
        lon;

    if (data.length === 1) {
        return Coordinates.fromString(data[0]);
    }

    if (data.length === 2) {
        lat = parseFloat(data[0]);
        lon = parseFloat(data[1]);
        if (Coordinates.valid(lat, lon)) {
            return new google.maps.LatLng(lat, lon);
        }
    }

    return null;
}


function parseLinesFromUrl(urlarg) {
    'use strict';

    if (urlarg === null) {
        return [];
    }

    var lines = [];

    /* be backwards compatible */
    if (urlarg.length === 3
            && alpha2id(urlarg[0]) >= 0
            && urlarg[1] === '*'
            && alpha2id(urlarg[1]) >= 0) {
        urlarg = urlarg[0] + ':' + urlarg[2];
    }

    urlarg.split('*').map(function (pair_string) {
        var m = {source: -1, target: -1},
            pair = pair_string.split(':');

        if (pair.length !== 2) {
            return;
        }

        m.source = alpha2id(pair[0]);
        m.target = alpha2id(pair[1]);

        lines.push(m);
    });

    return lines;
}


function parseMarkersFromCookies() {
    'use strict';

    var raw_ids = Cookies.get('markers'),
        markers = [];

    if (raw_ids === null || raw_ids === undefined) {
        return markers;
    }

    raw_ids.split(':').map(function (id_string) {
        var m = {id: null, name: null, coords: null, r: 0},
            raw_data,
            data,
            lat,
            lon;

        m.id = parseInt(id_string, 10);
        if (m.id === null || m.id < 0 || m.id >= 26 * 10) {
            return;
        }

        raw_data = Cookies.get('marker' + m.id);
        if (raw_data === null || raw_data === undefined) {
            return;
        }

        data = raw_data.split(':');
        if (data.length !== 4) {
            return;
        }

        lat = parseFloat(data[0]);
        lon = parseFloat(data[1]);
        if (!Coordinates.valid(lat, lon)) {
            return;
        }
        m.coords = new google.maps.LatLng(lat, lon);

        m.r = repairRadius(parseFloat(data[2]), 0);

        if (/^([a-zA-Z0-9-_]*)$/.test(data[3])) {
            m.name = data[3];
        }

        markers.push(m);
    });

    return markers;
}


function parseLinesFromCookies() {
    'use strict';

    var raw_lines = Cookies.get('lines'),
        lines = [];

    if (raw_lines === null || raw_lines === undefined) {
        return lines;
    }

    raw_lines.split('*').map(function (pair_string) {
        var m = {source: -1, target: -1},
            pair = pair_string.split(':');

        if (pair.length !== 2) {
            return;
        }

        m.source = alpha2id(pair[0]);
        m.target = alpha2id(pair[1]);

        lines.push(m);
    });

    return lines;
}


function initialize(xcenter, xzoom, xmap, xfeatures, xmarkers, xlines, xgeocache) {
    'use strict';

    var center = null,
        //atDefaultCenter = false,
        zoom = parseInt(xzoom, 10),
        maptype = xmap,
        loadfromcookies = false,
        markerdata = parseMarkersFromUrl(xmarkers),
        markercenter = null,
        clat = 0,
        clon = 0;
    if (markerdata.length > 0) {
        markerdata.map(function (m) {
            clat += m.coords.lat();
            clon += m.coords.lng();
        });
        markercenter = new google.maps.LatLng(clat / markerdata.length, clon / markerdata.length);
    }

    if (xcenter && xcenter !== '') {
        center = parseCenterFromUrl(xcenter);
    } else if (markercenter) {
        center = markercenter;
    } else {
        loadfromcookies = true;

        /* try to read coordinats from cookie */
        clat = get_cookie_float('clat', CLAT_DEFAULT);
        clon = get_cookie_float('clon', CLON_DEFAULT);
        //if (clat === CLAT_DEFAULT && clon === CLON_DEFAULT) {
        //    atDefaultCenter = true;
        //}

        clat = repairLat(clat, CLAT_DEFAULT);
        clon = repairLon(clon, CLON_DEFAULT);
        center = new google.maps.LatLng(clat, clon);

        zoom = get_cookie_int('zoom', ZOOM_DEFAULT);
        maptype = get_cookie_string('maptype', MAPTYPE_DEFAULT);
    }

    if (!center) {
        center = new google.maps.LatLng(CLAT_DEFAULT, CLON_DEFAULT);
        //atDefaultCenter = true;
    }

    zoom = repairZoom(zoom, ZOOM_DEFAULT);
    maptype = repairMaptype(maptype, MAPTYPE_DEFAULT);
    map = new google.maps.Map(
        document.getElementById("themap"),
        {
            zoom: zoom,
            center: center,
            scaleControl: true,
            streetViewControl: false,
            mapTypeControlOptions: { mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'OUTD', 'TOPO', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN] },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    );

    map.mapTypes.set("OSM", osmProvider("OSM"));
    map.mapTypes.set("OSM/DE", osmDeProvider("OSM/DE"));
    map.mapTypes.set("OCM", ocmProvider("OCM"));
    map.mapTypes.set("OUTD", thunderforestOutdoorsProvider("OUTD"));
    map.mapTypes.set("TOPO", opentopomapProvider("TOPO"));
    map.setMapTypeId(maptype);

    Sidebar.init(map);
    ExternalLinks.init(map);
    Lines.init(map);
    Geolocation.init(map);
    Hillshading.init(map);
    NPA.init(map);
    CDDA.init(map);
    Freifunk.init(map);
    Okapi.init(map);

    //boundariesLayer = new google.maps.ImageMapType({
    //  getTileUrl: function(coord, zoom) {
    //    if (6 <= zoom && zoom <= 16)
    //    {
    //      return tileUrl("http://korona.geog.uni-heidelberg.de/tiles/adminb/?x=%x&y=%y&z=%z", ["dummy"], coord, zoom);
    //    }
    //    else
    //    {
    //      return null;
    //    }
    //  },
    //  tileSize: new google.maps.Size(256, 256),
    //  name: "adminb",
    //  alt: "Administrative Boundaries",
    //  maxZoom: 16 });

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

    google.maps.event.addListener(map, "center_changed", function () {
        storeZoom();
        storeCenter();
    });
    google.maps.event.addListener(map, "zoom_changed", function () {
        storeZoom();
        storeCenter();
    });
    google.maps.event.addListener(map, "maptypeid_changed", function () {
        updateCopyrights();
    });

    if (loadfromcookies) {
        parseMarkersFromCookies().map(function (m) {
            newMarker(m.coords, m.id, m.r, m.name);
        });

        parseLinesFromCookies().map(function (m) {
            if (m.source >= 0 && theMarkers.getById(m.source).isFree()) {
                m.source = -1;
            }
            if (m.target >= 0 && theMarkers.getById(m.target).isFree()) {
                m.target = -1;
            }
            Lines.newLine(m.source, m.target);
        });
    } else {
        markerdata.map(function (m) {
            newMarker(m.coords, m.id, m.r, m.name);
        });

        parseLinesFromUrl(xlines).map(function (m) {
            if (m.source >= 0 && theMarkers.getById(m.source).isFree()) {
                m.source = -1;
            }
            if (m.target >= 0 && theMarkers.getById(m.target).isFree()) {
                m.target = -1;
            }
            Lines.newLine(m.source, m.target);
        });
    }

    Okapi.setShowCache(xgeocache);
    Sidebar.restore(true);
    xfeatures = xfeatures.toLowerCase();
    if (xfeatures === '[default]') {
        Hillshading.restore(false);
        //restoreBoundaries(false);
        Okapi.restore(false);
        NPA.toggle(false);
        CDDA.toggle(false);
        Freifunk.toggle(false);
    } else {
        Hillshading.toggle(xfeatures.indexOf('h') >= 0);
        //toggleBoundaries(xfeatures.indexOf('b') >= 0);
        Okapi.toggle(xfeatures.indexOf('g') >= 0);
        NPA.toggle(xfeatures.indexOf('n') >= 0);
        Freifunk.toggle(xfeatures.indexOf('f') >= 0);
    }
    restoreCoordinatesFormat("DM");

    if (xgeocache !== "") {
        Okapi.toggle(true);
        //atDefaultCenter = false;
    }

    // update copyrights + gmap-stuff now, once the map is fully loaded, and in 1s - just to be sure!
    updateCopyrights();
    google.maps.event.addListenerOnce(map, 'idle', function () {
        updateCopyrights();
    });
    setTimeout(function () {
        updateCopyrights();
    }, 1000);

    //if (atDefaultCenter) {
    //  Geolocation.whereAmI();
    //}
}
