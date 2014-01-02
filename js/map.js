var geocoder;
var geocoder;
var markers = null;
var boundary_layer = null;
var boundary_layer_fusion_table = "1Fg-gWjzai7awzjO30BFP_i_67zaRwrCCoMBRJ5Y"; // GADM.org
//var boundary_layer_fusion_table = "14CNp_bLGOQTmtR-8vMxInDZdtHXvAGE3ZbMrF_w"; // GSAK
var hillshadingLayer = null;
var hillshadingLayerShown = false;
var map;
var copyrightDiv;

var lines = new Array();
var nextLineId = 0;

var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var MAPTYPE_DEFAULT = "OSM";
var RADIUS_DEFAULT = 161;

var externalLinkTargets = null;

function setupExternalLinkTargets()
{
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
    
    for( var index in e ) 
    {
        $('#externallinks').append('<option value="'+index+'">'+index+'</option>');
    }
    
    externalLinkTargets = e;
}

function gotoExternalLink()
{
    var selected = $('#externallinks').find(":selected").text();
    var url = externalLinkTargets[selected];
    if( url == null || url == '' ) return;
    
    lat = map.getCenter().lat();
    lon = map.getCenter().lng();
    latE6 = Math.round( lat * 1000000 );
    lonE6 = Math.round( lon * 1000000 );
    lat = lat.toFixed(6);
    lon = lon.toFixed(6);
    zoom = map.getZoom();
    
    url = url.replace( /%lat%/g, lat );
    url = url.replace( /%lon%/g, lon );
    url = url.replace( /%late6%/g, latE6 );
    url = url.replace( /%lone6%/g, lonE6 );
    url = url.replace( /%zoom%/g, zoom );
    
    window.open(url, '_blank');
}

function id2alpha( id )
{
    var s = "";
    if( id >= 0 && id < 26 )
    {
        var code = 'A'.charCodeAt() + id;
        s = String.fromCharCode( code );
    }
    return s;
}

function alpha2id( alpha )
{
    if( alpha.length != 1 ) return -1;
    
    var id = -1;
 
    if( alpha[0] >= 'A' && alpha[0] <= 'Z' ) id = alpha.charCodeAt(0) - 'A'.charCodeAt(0); 
    if( alpha[0] >= 'a' && alpha[0] <= 'z' ) id = alpha.charCodeAt(0) - 'a'.charCodeAt(0); 
    
    if( id < 0 || id >= 26 ) id = -1;
    
    return id;
}

function newLine()
{
    var m = new Object();
    m.id = nextLineId;
    ++nextLineId;
    
    m.line = null;
    m.source = -1;
    m.target = -1;
    lines.push( m );
    
    $('#dynLineDiv').append( 
    "<div id=\"dynLine" + m.id + "\">" +
    "<table style=\"width: 100%\">" +
    "<tr>" +
    "<td>" +
    "<select id=\"dynlinesource" + m.id + "\" class=\"my-small-select\" title=\"Source\" onchange=\"selectLineSource("+m.id+")\"><option value=\"-1\">?</option></select>" +
    "&nbsp;&rarr;&nbsp;" +
    "<select id=\"dynlinetarget" + m.id + "\" class=\"my-small-select\" title=\"Target\" onchange=\"selectLineTarget("+m.id+")\"><option value=\"-1\">?</option></select>" +
    "</td>" +
    "<td>" +
    "<button class=\"my-button btn btn-mini btn-danger\" style=\"float: right\" title=\"Delete line\" type=\"button\" onClick=\"deleteLine(" + m.id + ")\"><i class=\"fa fa-trash-o\"></i></button>" +
    "<div>" +
    "</div>" +
    "</td>" +
    "</tr>" +
    "<tr><td colspan=\"2\"><i class=\"fa fa-arrows-h\"></i> <span id=\"dynlinedist" + m.id + "\">n/a</span> <i class=\"fa fa-compass\"></i> <span id=\"dynlineangle" + m.id + "\">n/a</span></td></tr>" +
    "</table>" +
    "</div>"
    );
    
    
    
    for( var i = 0; i < markers.length; ++i )
    {
        if( !markers[i].free )
        {
            updateLineMarkerAdded( m.id, markers[i].id );
        }
    }
    
    saveLinesCookie();
    updateLinks();
    
    return m.id;
}

function getLineIndex( id )
{
    for( var index = 0; index < lines.length; ++index )
    {
        var line = lines[index];
        if( line == null ) continue;
        
        if( line.id == id )
        {
            return index;
        }
    }
    
    return -1;
}


function getLineById( id )
{
    return lines[getLineIndex( id )];
}

function getLinesText()
{
    var a = Array();
    for( var index = 0; index < lines.length; ++index )
    {
        var line = lines[index];
        if( line == null ) continue;
        
        a.push( id2alpha( line.source ) + ":" + id2alpha( line.target ) );
    }
    
    return a.join("*");
}

function saveLinesCookie()
{
    $.cookie("lines", getLinesText(), {expires: 30});
}

function selectLineSourceById( id, markerid )
{
    var index = getLineIndex( id );
    var line = lines[index];
       
    if( markerid != line.source )
    {
        line.source = markerid;
        updateLineIndex( index, id );
        $("#dynlinesource" + id + " > option[value=" + markerid + "]").attr("selected", "selected");
    }
    
    saveLinesCookie();
    updateLinks();
}

function selectLineSource( id )
{
    var line = getLineById( id );
    
    var markerid = -1;
    var opt = $("#dynlinesource" + id +" option:selected");
    if( opt )
    {
        markerid = parseInt( opt.val() );
    }
    
    selectLineSourceById( id, markerid );
}

function selectLineTargetById( id, markerid )
{
    var index = getLineIndex( id );
    var line = lines[index];
    
    if( markerid != line.target )
    {
        line.target = markerid;
        updateLineIndex( index, id );
        $("#dynlinetarget" + id + " > option[value=" + markerid + "]").attr("selected", "selected");
    }
    
    saveLinesCookie();
    updateLinks();
}

function selectLineTarget( id )
{
    var markerid = -1;
    var opt = $("#dynlinetarget" + id +" option:selected");
    if( opt )
    {
        markerid = parseInt( opt.val() );
    }
    
    selectLineTargetById( id, markerid );
}

function updateLinesMarkerMoved( markerId )
{
    for( var index = 0; index < lines.length; ++index )
    {
        var line = lines[index];
        if( line == null ) continue;
        
        if( line.source == markerId || line.target == markerId )
        {
            updateLineIndex( index, line.id );
        }
    }
}

function updateLineMarkerAdded( id, markerId )
{
    var source = $('#dynlinesource' + id);
    var target = $('#dynlinetarget' + id);
    
    source.empty();
    target.empty();

    source.append('<option value="-1">?</option>');
    target.append('<option value="-1">?</option>');

    for( var i = 0; i < markers.length; ++i )
    {
        var m = markers[i];
        if( !m.free )
        {   
            source.append('<option value="'+m.id+'">'+m.alpha+'</option>');
            target.append('<option value="'+m.id+'">'+m.alpha+'</option>');
        }
    }
    
    $("#dynlinesource" + id + " > option[value=" + lines[id].source + "]").attr("selected", "selected");
    $("#dynlinetarget" + id + " > option[value=" + lines[id].target + "]").attr("selected", "selected");
}

function updateLinesMarkerAdded( markerId )
{
    for( var index = 0; index < lines.length; ++index )
    {
        var line = lines[index];
        if( line == null ) continue;
        
        updateLineMarkerAdded( line.id, markerId );
    }
}

function updateLinesMarkerRemoved( markerid )
{
    for( var index = 0; index < lines.length; ++index )
    {
        var line = lines[index];
        if( line == null ) continue;
        
        if( line.source == markerid )
        {
            line.source = -1;
            if( line.line != null )
            {
                line.line.setMap( null );
                line.line = null;
            }
        }
        
        if( line.target == markerid )
        {
            line.target = -1;
            if( line.line != null )
            {
                line.line.setMap( null );
                line.line = null;
            }
        }
        
        var source = $('#dynlinesource' + line.id);
        var target = $('#dynlinetarget' + line.id);
        
        source.empty();
        target.empty();
    
        source.append('<option value="-1">?</option>');
        target.append('<option value="-1">?</option>');
    
        for( var i = 0; i < markers.length; ++i )
        {
            var m = markers[i];
            if( !m.free )
            {   
                source.append('<option value="'+m.id+'">'+m.alpha+'</option>');
                target.append('<option value="'+m.id+'">'+m.alpha+'</option>');
            }
        }
        
        $("#dynlinesource" + line.id + " > option[value=" + line.source + "]").attr("selected", "selected");
        $("#dynlinetarget" + line.id + " > option[value=" + line.target + "]").attr("selected", "selected");
    }
    
    saveLinesCookie();
}

function updateLineIndex( index, id )
{
    var line = lines[index];
    if( line == null )
    {
        return;
    }
    
    if( line.source == -1 || line.target == -1 )
    {
        if( line.line != null )
        {
            line.line.setMap( null );
            line.line = null;
        }
        
        $("#dynlinedist" + id).html( "n/a" );
        $("#dynlineangle" + id).html( "n/a" );
    }
    else
    {
        if( line.line == null )
        {   
            line.line = new google.maps.Polyline( { 
                strokeColor: '#ff0000', 
                strokeWeight: 2, 
                strokeOpacity: 0.7, 
                geodesic: true } );
            line.line.setMap( map );
        }
        
        var m1 = markers[line.source];
        var m2 = markers[line.target];
        
        var path = new google.maps.MVCArray;
        path.push( m1.marker.getPosition() );
        path.push( m2.marker.getPosition() );
        line.line.setPath( path ); 
        
        if( line.source == line.target )
        {
            $("#dynlinedist" + id).html( "0m" );
            $("#dynlineangle" + id).html( "n/a" );
        }
        else
        {
            var da = dist_angle_geodesic( m1.marker.getPosition(), m2.marker.getPosition() );
            
            var dist = da.dist.toFixed();
            $("#dynlinedist" + id).html( dist + "m" );
            if( dist == 0 )
            {
                $("#dynlineangle" + id).html( "n/a" );
            }
            else
            {
                $("#dynlineangle" + id).html( da.angle.toFixed( 1 ) + "°" );
            }
        }
    }
}

function updateLine( id )
{
    var index = getLineIndex( id );
    updateLineIndex( index, id );
}

function deleteLine( id )
{
    $('#dynLine' + id).remove();
    
    var index = getLineIndex( id );
    var line = lines[index];
    
    if( line.line != null )
    {
        line.line.setMap( null );
        line.line = null;
    }
    
    lines[index] = null;
    
    updateLinks();
    saveLinesCookie();
}

function deleteAllLines()
{
  for (var i = 0; i < lines.length; ++i)
  {
    var line = lines[i];
    if (line == null) continue;
    deleteLine(line.id);
  }
}

function updateMarker( m )
{
    var pos = m.marker.getPosition();
    var r = m.circle.getRadius();
    
    m.circle.setCenter( pos );
    
    $.cookie('marker' + m.id, pos.lat().toFixed(6) + ":" + pos.lng().toFixed(6) + ":" + r + ":" + m.name, {expires:30});
    $('#view_name' + m.alpha ).html( m.name ); 
    $('#view_coordinates' + m.alpha ).html( coords2string( pos ) ); 
    $('#view_circle' + m.alpha ).html( r );
    $('#edit_name' + m.alpha ).val( m.name ); 
    $('#edit_coordinates' + m.alpha ).val( coords2string( pos ) ); 
    $('#edit_circle' + m.alpha ).val( r );
    
    updateLinesMarkerMoved( m.id );    
    updateLinks();
}

function setName( id, name )
{
    var m = getMarkerById( id );
    m.name = name;
    updateMarker( m );
}

function setRadius( m, r )
{
    m.circle.setRadius( r );
    updateMarker( m );
}

function getFreeId()
{
    for( var i = 0; i < markers.length; ++i )
    {
        if( markers[i].free )
        {
            return i;
        }
    }
    return -1;
}

function getMarkerById( id )
{
    return markers[id];
}

function visibleMarkers()
{
    var count = 0;
    
    for( var i = 0; i < markers.length; ++i )
    {
        var m = markers[i];
        if( !m.free ) count++;
    }
    return count;
}

function updateMarkerList()
{
    var lst = Array();
    
    for( var i = 0; i < markers.length; ++i )
    {
        var m = markers[i];
        if( !m.free )
        {   
            lst.push( m.id );
        }
    }
    
    $.cookie('markers', lst.join( ":" ), {expires:30});
}

function removeMarker( id )
{
    var m = markers[id];
    if( m.free )
    {
        return;
    }
    
    m.free = true;
    m.marker.setMap( null );
    m.circle.setMap( null );
    m.marker = null;
    m.circle = null;
    
    $('#dyn' + m.id).remove();
    
    if( visibleMarkers() == 0 )
    {
      $('#btnmarkers2').hide();
    }

    updateMarkerList();
    updateLinesMarkerRemoved( id );
    updateLinks();
}

function deleteAllMarkers()
{
  for (var i = 0; i < markers.length; ++i)
  {
    var m = markers[i];
    if (m.free) continue;
    removeMarker(m.id);
  }
}

function gotoMarker( id )
{
    var m = getMarkerById( id );
    map.setCenter( m.marker.getPosition() );
    updateLinks();
}

function centerMarker( id )
{
    var m = getMarkerById( id );
    m.marker.setPosition( map.getCenter() );
    updateMarker( m );
}

function enterEditMode( id )
{
    var m = getMarkerById( id );
    
    $('#edit_name' + m.alpha ).val( m.name ); 
    $('#edit_coordinates' + m.alpha ).val( coords2string( m.marker.getPosition() ) ); 
    $('#edit_circle' + m.alpha ).val( m.circle.getRadius() );
    
    $('#dynview' + id).hide();
    $('#dynedit' + id).show();    
}

function leaveEditMode( id, takenew )
{
    if( takenew )
    {
        var m = getMarkerById( id );
        
        var name = $('#edit_name' + m.alpha).val();
        var name_ok = /^([a-zA-Z0-9-_]*)$/.test( name );
        
        var s_coordinates = $('#edit_coordinates' + m.alpha).val();
        var coordinates = string2coords( s_coordinates );
        
        var s_circle = $('#edit_circle' + m.alpha).val();
        var circle = getInteger( s_circle, 0, 100000000000 );
        
        var errors = Array();
        
        if( !name_ok )
        {
            errors.push( "Bad character in 'name': \"%1\".<br />Allowed characters: a-z, A-Z, 0-9, - and _.".replace( /%1/, name ) );
        }
        if( coordinates == null )
        {
            errors.push( "Bad coordinate format: \"%1\".".replace( /%1/, s_coordinates ) );
        }
        if( circle == null )
        {
            errors.push( "Bad value of 'radius': \"%1\".<br />Allowed values: integers &geq; 0".replace( /%1/, s_circle ) );
        }
        
        if( errors.length > 0 ) 
        {
            showAlert( "Error", errors.join( "<br /><br />" ) );
        }
        else
        {
            m.name = name;
            m.marker.setPosition( coordinates );
            setRadius( m, circle );
            
            updateMarker( m );
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

function newMarker( coordinates, theid, radius, name )
{
    if( radius < 0 ) radius = RADIUS_DEFAULT;
    
    var id = theid;
    if( id == -1 || id < 0 || id >= 26 || markers[id].free == false ) id = getFreeId();
    if( id == -1 )
    {
        showAlert("Error", "Maximum number of markers (26) reached.");
        return null;
    }
    
    var nextid = markers.length;
    for( var i = id+1; i < markers.length; ++i )
    {
        if( !markers[i].free )
        {
            nextid = i;
            break;
        }
    }
    
    var m = markers[id];
    m.free = false;
    if( name == null )
    {
        m.name = "marker_" + m.alpha;
    }
    else
    {
        m.name = name;
    }
    
    // base.png is 7x4 icons (each: 32px x 37px)
    var iconw = 32;
    var iconh = 37;
    var offsetx = (m.id % 7)*iconw;
    var offsetx = (m.id % 7)*iconw;
    var offsety = Math.floor(m.id / 7)*iconh;
    m.marker = new google.maps.Marker( {
        position: coordinates, 
        map: map,
        icon: new google.maps.MarkerImage( 
            "img/base.png", 
            new google.maps.Size(iconw, iconh),
            new google.maps.Point(offsetx, offsety), 
            new google.maps.Point(15.5,36) ),
        draggable: true } );
    
    google.maps.event.addListener( m.marker, "drag", function() { updateMarker( m ); } );        
    google.maps.event.addListener( m.marker, "dragend", function() { updateMarker( m ); } );      
    
    colors = [ "#03ab17", "#d10f12", "#0d58d9", "#9d0ac2", "#ff8a22", "#27bcd6", "#3d3d3d" ];
    
    m.circle = new google.maps.Circle( {
        center: coordinates, 
        map: map,
        strokeColor: colors[m.id % 7],
        strokeOpacity: 1,
        fillColor: colors[m.id % 7],
        fillOpacity: 0.25,
        strokeWeight: 1,
        radius: radius } );

    var div = 
    "<div id=\"dyn" + m.id + "\">" +
    "<table id=\"dynview" + m.id + "\" style=\"width: 100%; vertical-align: middle;\">\n" +
    "    <tr>\n" +
    "        <td rowspan=\"3\" style=\"vertical-align: top\">\n" +
    "            <span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/base.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
    "        </td>\n" +
    "        <td style=\"text-align: center\"><i class=\"fa fa-map-marker\"></i></td>\n" +
    "        <td id=\"view_name" + m.alpha +"\" colspan=\"2\">marker</td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "        <td style=\"text-align: center\"><i class=\"fa fa-globe\"></i></td>\n" +
    "        <td id=\"view_coordinates" + m.alpha +"\" colspan=\"2\">N 48° 00.123 E 007° 51.456</td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "        <td style=\"text-align: center\"><i class=\"fa fa-circle-o\"></i></td>\n" +
    "        <td id=\"view_circle" + m.alpha +"\">16100 m</td>\n" +
    "        <td>\n" +
    "            <div class=\"btn-group\" style=\"padding-bottom: 2px; padding-top: 2px; float: right\">\n" +
    "            <button class=\"my-button btn btn-mini btn-warning\" title=\"Edit marker\" type=\"button\"  onclick=\"enterEditMode(" + m.id + ");\"><i class=\"fa fa-edit\"></i></button>\n" +
    "            <button class=\"my-button btn btn-mini btn-danger\" title=\"Remove marker\" type=\"button\" onClick=\"removeMarker(" + m.id + ")\"><i class=\"fa fa-trash-o\"></i></button>\n" +
    "            <button class=\"my-button btn btn-mini btn-info\" title=\"Move map to marker\" type=\"button\" onClick=\"gotoMarker(" + m.id + ")\"><i class=\"fa fa-search\"></i></button>\n" +
    "            <button class=\"my-button btn btn-mini btn-warning\" title=\"Put marker on center of map\" type=\"button\" onClick=\"centerMarker(" + m.id + ")\"><i class=\"fa fa-crosshairs\"></i></button>\n" +
    "            <button class=\"my-button btn btn-mini btn-success\" title=\"Waypoint projection from marker\" type=\"button\" onClick=\"projectFromMarker(" + m.id + ")\"><i class=\"fa fa-location-arrow\"></i></button>\n" +
    "            </div>\n" +
    "        </td>\n" +
    "    </tr>\n" +
    "</table>\n" +
    "<table id=\"dynedit" + m.id + "\" style=\"display: none; width: 100%; vertical-align: middle;\">\n" +
    "    <tr>\n" +
    "        <td rowspan=\"4\" style=\"vertical-align: top\"><span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/base.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
    "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-map-marker\"></i></td>\n" +
    "        <td><input id=\"edit_name" + m.alpha + "\" title=\"Name of the marker\" placeholder=\"Name\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-globe\"></i></td>\n" +
    "        <td><input id=\"edit_coordinates" + m.alpha +"\" title=\"Coordinates of the marker\" placeholder=\"Coordinates\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-circle-blank\"></i></td>\n" +
    "        <td><input id=\"edit_circle" + m.alpha +"\" title=\"Radius (m) of circle around the marker\" placeholder=\"Radius (m)\" class=\"form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
    "    </tr>\n" +
    "    <tr>\n" +
    "        <td colspan=\"2\" style=\"text-align: right\">\n" +
    "            <button class=\"btn btn-small btn-primary\" type=\"button\" onclick=\"javascript: leaveEditMode(" + m.id + ", true );\">Ok</button>\n" +
    "            <button class=\"btn btn-small\" type=\"button\" onclick=\"leaveEditMode(" + m.id + ", false );\">Cancel</button>\n" +
    "        </td>\n" +
    "    </tr>\n" +
    "</table>" +
    "</div>";
    
    
    if( nextid == markers.length )
    {
        $('#dynMarkerDiv').append(div);
    }
    else
    {
      $(div).insertBefore('#dyn' + nextid);
    }
    
    $('#edit_name' + m.alpha).keydown( function( e ) {
        if( e.which == 27 ) { leaveEditMode( m.id, false ); }
        else if( e.which == 13 ) { leaveEditMode( m.id, true ); }
    } );
    
    $('#edit_coordinates' + m.alpha).keydown( function( e ) {
        if( e.which == 27 ) { leaveEditMode( m.id, false ); }
        else if( e.which == 13 ) { leaveEditMode( m.id, true ); }
    } );
    
    $('#edit_circle' + m.alpha).keydown( function( e ) {
        if( e.which == 27 ) { leaveEditMode( m.id, false ); }
        else if( e.which == 13 ) { leaveEditMode( m.id, true ); }
    } );
    
    $('#btnmarkers2').show();
    $('#btnmarkersdelete1').removeAttr('disabled');
    $('#btnmarkersdelete2').removeAttr('disabled');
    
    updateMarker( m );
    updateMarkerList();
    updateLinesMarkerAdded( m.id );
    updateLinks();
    
    return m;
}

function projectFromMarker( id )
{
    var mm = getMarkerById( id );
    var oldpos = mm.marker.getPosition();
    
    showDoubleInputDialog( 
        "Waypoint Projection", 
        "Bearing in ° (0-360)",
        0,
        "Distance in meters (>0)",
        0, 
        function(data1, data2)
        {
            var angle = getFloat( data1, 0, 360 );
            var dist = getFloat( data2, 0, 100000000000 );
            
            if( angle == null )
            {
                showAlert( "Error", "Bad 'bearing' value: \"%1\".<br />Allowed values: floating point numbers between 0 and 360.".replace( /%1/, data1 ) );
                return;
            }
            
            if( dist == null )
            {
                showAlert( "Error", "Bad 'distance' value: \"%1\".<br />Allowed values: floating point numbers &geq; 0.".replace( /%1/, data2 ) );
                return;
            }

            var newpos = projection_geodesic( oldpos, angle, dist );
            var m = newMarker( newpos, -1, RADIUS_DEFAULT, null );
            if( m != null )
            {
                showAlert( "Information", "Created new marker: %1.".replace( /%1/, m.alpha ) );
            }        
        }
    );
}

function storeCenter()
{
    c = map.getCenter();
    $.cookie( 'clat', c.lat(), {expires:30});
    $.cookie( 'clon', c.lng(), {expires:30});
    
    updateLinks();
}

function storeZoom()
{
    $.cookie('zoom', map.getZoom(), {expires:30});
    
    updateLinks();
}

function updateLinks()
{
    lat = map.getCenter().lat();
    lng = map.getCenter().lng();
    latE6 = Math.round( lat * 1000000 );
    lngE6 = Math.round( lng * 1000000 );
    zoom = map.getZoom();
    
    var s = "&m=";
    for( var i = 0; i != markers.length; ++i )
    {
        var m = markers[i];
        if( m.free ) continue;
        var p = m.marker.getPosition();
        
        s = s + m.alpha + ":" + p.lat().toFixed(6) + ":" + p.lng().toFixed(6) + ":" + m.circle.getRadius() + ":" + m.name + "*";
    }
    ftklink = "http://flopp.net/?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) + "&z=" + zoom + "&t=" + map.getMapTypeId() + s;    
    ftklink = ftklink + "&d=" + getLinesText();
    
    $( "#permalink" ).attr( "href", ftklink );
}

function updateCopyrights() 
{
    if( copyrightDiv == null )
    {
        return;
    }
    
    newMapType = map.getMapTypeId();
    $.cookie('maptype', newMapType, {expires:30});
    
    if( newMapType == "OSM" || newMapType == "OSM/DE" )
    {
        copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>";
    }
    else if( newMapType == "OCM" )
    {
        copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://opencyclemap.org\">OpenCycleMap.org</a>";
    }
    else if( newMapType == "MQ" )
    {
        copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://mapquest.com\">MapQuest</a>";
    }
    else if( newMapType == "OUTD" )
    {
        copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://www.thunderforest.com/outdoors/\">Thunderforest</a>";
    }
    else
    {
        copyrightDiv.innerHTML = "";
    }
    
    updateLinks();
}

function toggleBoundaryLayer( t )
{
    if( t )
    {
        boundary_layer = new google.maps.FusionTablesLayer( {
            query: {
                select: 'geometry',
                from: boundary_layer_fusion_table
            },
            styles: [{
                polygonOptions: {
                    fillColor: '#0000FF',
                    fillOpacity: 0.1,
                    strokeColor: '#0000FF',
                    strokeOpacity: 1,
                    strokeWeight: 2
                }
            }],
            clickable: false,
            suppressInfoWindows: true,
            map: map
        });
    }
    else
    {
        boundary_layer.setMap( null );
        boundary_layer = null;
    }
}

function toggleHillshadingLayer( t )
{
    if( hillshadingLayerShown == t ) return;
    
    hillshadingLayerShown = t;
    
    if( t )
    {
        map.overlayMapTypes.setAt( 0, hillshadingLayer );
    }
    else
    {
        map.overlayMapTypes.setAt( 0, null );
    }
    
    $( '#hillshading' ).attr( 'checked', hillshadingLayerShown );
    $.cookie('hillshading', hillshadingLayerShown ? 1 : 0, {expires:30});
}

function repairLat( x, d )
{
    if( x == null || x == NaN || x < -90 || x > +90 )
    {
        return d;
    }
    else
    {
        return x;
    }
}

function repairLon( x, d )
{
    if( x == null || x == NaN || x < -180 || x > +180 )
    {
        return d;
    }
    else
    {
        return x;
    }
}

function repairRadius( x, d )
{
    if( x == null || x == NaN || x < 0 || x > 100000000 )
    {
        return d;
    }
    else
    {
        return x;
    }
}

function repairZoom( x, d )
{
    if( x == null || x == NaN || x < 1 || x > 20 )
    {
        return d;
    }
    else
    {
        return x;
    }
}

function repairMaptype( t, d )
{
    if( t == "OSM" || t == "OSM/DE" || t == "OCM" )
    {
        return t;
    }
    else if( t == "MQ" )
    {
        return t;
    }
    else if( t == "OUTD" )
    {
        return t;
    }
    else if( t == "satellite" || t == "hybrid" || t == "roadmap" || t == "terrain" )
    {
        return t;
    }
    else
    {
        return d;
    }
}

function randomString( strings, number )
{
    var index = number % strings.length;
    return strings[index];
}

function tileUrl( template, servers, coord, zoom )
{
    var limit = Math.pow( 2, zoom );
    var x = ( ( coord.x % limit ) + limit ) % limit;
    var y = coord.y;
    var s = servers[ ( Math.abs( x + y ) ) % servers.length ];
    return template.replace( /%s/, s ).replace( /%x/, x ).replace( /%y/, y ).replace( /%z/, zoom );
}

function initialize( xcenter, xzoom, xmap, xmarkers, xlines )
{
    var center = null;
    var zoom = parseInt( xzoom );
    var maptype = xmap;
    
    markers = new Array();
    for( var i = 0; i != 26; i++ )
    {
        var m = new Object();
        m.id = i;
        m.alpha = id2alpha( m.id );
        m.free = true;
        m.name = "";
        m.marker = null;
        m.circle = null;
        markers.push( m );
    }
    
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
        if( xmarkers.indexOf("*") != -1 )
        {
            data = xmarkers.split('*');
        }
        else /*if( xmarkers.indexOf("|") != -1 )*/
        {
            data = xmarkers.split('|');
        }
        
        for( var i = 0; i != data.length; ++i )
        {
            var data2 = data[i].split(':');
            
            if( data2.length < 3 || data2.length > 5 ) continue;
            
            var m = new Object();
            
            m.alpha = data2[0];
            m.id = alpha2id( m.alpha );
            if( m.id == -1 ) continue;
            
            m.name = null;
                        
            var index = 1;
            
            var lat = parseFloat( data2[index] );
            var lon = parseFloat( data2[index+1] );
            if( lat != null && lon != null && -90 <= lat && lat <= 90 && -180 <= lon && lon <= 180 )
            {
                index = index + 2;
                m.coords = new google.maps.LatLng( lat, lon );
            }
            else
            {
                m.coords = string2coords( data2[index] ); 
                if( m.coords == null ) continue;
                
                index = index + 1;
            }            
            
            var circle = parseFloat( data2[index] );
            if( circle < 0 || circle > 100000000000 ) continue;
            m.r = circle;
            index = index + 1;
            
            if( index < data2.length )
            {
                if( /^([a-zA-Z0-9-_]*)$/.test( data2[index] ) )
                {
                    m.name = data2[index];
                }
            }

            count += 1;
            clat += m.coords.lat();
            clon += m.coords.lng();
            
            markerdata.push( m );
        }
        
        if( count != 0 )
        {
            markercenter = new google.maps.LatLng( clat/count, clon/count );
        }
    }
    
    var loadfromcookies = false;
    
    if( xcenter != null && xcenter != '' )
    {
        var data = xcenter.split(':');
        
        if( data.length == 1 )
        {
            center = string2coords( xcenter ); 
        }
        else
        {
            var lat = parseFloat( data[0] );
            var lon = parseFloat( data[1] );
            
            if( lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180 )
            {
                center = new google.maps.LatLng( lat, lon );
            }
        }
    }
    else if( markercenter != null )
    {
        center = markercenter;
    }
    else
    {
        loadfromcookies = true;
        
        /* try to read coordinats from cookie */
        clat = get_cookie_float('clat', CLAT_DEFAULT);
        clon = get_cookie_float('clon', CLON_DEFAULT);
        clat = repairLat( clat, CLAT_DEFAULT );
        clon = repairLon( clon, CLON_DEFAULT );
        center = new google.maps.LatLng( clat, clon );
        
        zoom = get_cookie_int('zoom', ZOOM_DEFAULT);
        maptype = get_cookie_string('maptype', MAPTYPE_DEFAULT);
    }
    
    if( center == null )
    {
        center = new google.maps.LatLng( CLAT_DEFAULT, CLON_DEFAULT );
    }
    
    zoom = repairZoom( zoom, ZOOM_DEFAULT );
    maptype = repairMaptype( maptype, MAPTYPE_DEFAULT );
    
    var myOptions = {
        zoom: zoom,
        center: center,
        scaleControl: true,
        mapTypeControlOptions: { mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'MQ', 'OUTD', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN] },
        mapTypeId: google.maps.MapTypeId.ROADMAP };
        
    map = new google.maps.Map(document.getElementById("themap"), myOptions);
    
    osm_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { 
            return tileUrl( "http://%s.tile.openstreetmap.org/%z/%x/%y.png", ["a","b","c"], coord, zoom );
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM",
        alt: "OpenStreetMap",
        maxZoom: 18 });
    osmde_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { 
            return tileUrl( "http://%s.tile.openstreetmap.de/tiles/osmde/%z/%x/%y.png", ["a","b","c"], coord, zoom );
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM/DE",
        alt: "OpenStreetMap (german style)",
        maxZoom: 18 });
    ocm_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { 
            return tileUrl( "http://%s.tile.opencyclemap.org/cycle/%z/%x/%y.png", ["a","b","c"], coord, zoom );
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OCM",
        alt: "OpenCycleMap",
        maxZoom: 17 });
    mq_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { 
            return tileUrl( "http://otile%s.mqcdn.com/tiles/1.0.0/osm/%z/%x/%y.png", ["1","2","3","4"], coord, zoom );
        },
        tileSize: new google.maps.Size(256, 256),
        name: "MQ",
        alt: "MapQuest (OSM)",
        maxZoom: 18 });
    outdoors_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { 
            return tileUrl( "http://%s.tile.thunderforest.com/outdoors/%z/%x/%y.png", ["a","b","c"], coord, zoom );
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OUTD",
        alt: "Thunderforest Outdoors",
        maxZoom: 18 });
    
    map.mapTypes.set("OSM", osm_type );
    map.mapTypes.set("OSM/DE", osmde_type );
    map.mapTypes.set("OCM", ocm_type );
    map.mapTypes.set("MQ", mq_type );
    map.mapTypes.set("OUTD", outdoors_type );
    
    map.setMapTypeId( maptype );
    
    boundary_layer = null;
    
    hillshadingLayer = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { 
            if( 6 <= zoom && zoom <= 16 ) 
            {
                return tileUrl( "http://toolserver.org/~cmarqu/hill/%z/%x/%y.png", ["dummy"], coord, zoom );
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
    map.overlayMapTypes.push( null );
    
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
   
    google.maps.event.addListener( map, "center_changed", function() { storeZoom(); storeCenter(); okapi_schedule_load_caches(); } );
    google.maps.event.addListener( map, "zoom_changed", function() { storeZoom(); storeCenter(); okapi_schedule_load_caches(); } );
    google.maps.event.addListener( map, "maptypeid_changed", function(){ updateCopyrights()});
    
    geocoder = new google.maps.Geocoder();
    
    
    if( loadfromcookies )
    {
        raw_ids = $.cookie('markers');
        if( raw_ids != undefined )
        {
            ids = raw_ids.split(':');
            for( var i = 0; i != ids.length; ++i )
            {
                var id = parseInt(ids[i]);
                if( id == null || id < 0 || id >=26 ) continue;
                
                var raw_data = $.cookie( 'marker' + id );
                if( raw_data == undefined ) continue;
                
                var data = raw_data.split(':')
                if( data.length != 3 && data.length != 4 ) continue;
                
                var lat = parseFloat( data[0] );
                if( lat < -90 || lat > 90 ) continue;
                var lon = parseFloat( data[1] );
                if( lon < -180 || lon > 180 ) continue; 
                var r = parseFloat( data[2] );
                if( r < 0 || r > 100000000000 ) continue; 
                
                var name = null;
                
                if( data.length == 4 )
                {
                    if( /^([a-zA-Z0-9-_]*)$/.test( data[3] ) )
                    {
                        name = data[3];
                    }
                }
                
                newMarker( new google.maps.LatLng( lat, lon ), id, r, name );
            }
        }
        
        var raw_lines = $.cookie('lines');
        if( raw_lines != undefined )
        {
            var linesarray = raw_lines.split( '*' );
            for( var i = 0; i < linesarray.length; ++i )
            {
                var line = linesarray[i].split( ':' );
                if( line.length != 2 ) continue;
                
                var id = newLine();
                
                var id1 = alpha2id( line[0] );
                if( id1 != -1 && markers[id1].free == false )
                {
                    selectLineSourceById( id, id1 );
                }
                var id2 = alpha2id( line[1] );
                if( id2 != -1 && markers[id2].free == false )
                {
                    selectLineTargetById( id, id2 );
                }
            }
        }
    }
    else
    {
        for( var i = 0; i < markerdata.length; ++i )
        {
            newMarker( markerdata[i].coords, markerdata[i].id, markerdata[i].r, markerdata[i].name );
        }
        
        var raw_lines = xlines;
        if( raw_lines != null )
        {
            /* be backwards compatible */
            if( raw_lines.length == 3 
                && raw_lines[0] >= 'A' && raw_lines[0] <= 'Z' 
                && raw_lines[1] == '*' 
                && raw_lines[2] >= 'A' && raw_lines[2] <= 'Z' )
            {
                raw_lines = raw_lines[0] + ':' + raw_lines[2];
            }
            
            var linesarray = raw_lines.split( '*' );
            for( var i = 0; i < linesarray.length; ++i )
            {
                var line = linesarray[i].split( ':' );
                if( line.length != 2 ) continue;
                
                var id = newLine();
                
                var id1 = alpha2id( line[0] );
                if( id1 != -1 && markers[id1].free == false )
                {
                    selectLineSourceById( id, id1 );
                }
                var id2 = alpha2id( line[1] );
                if( id2 != -1 && markers[id2].free == false )
                {
                    selectLineTargetById( id, id2 );
                }
            }
        }
    }
    
    updateCopyrights();
    
    toggleHillshadingLayer( true );
    
    setupExternalLinkTargets();
        
    updateLinks();
    
    var load_caches = get_cookie_int("load_caches", 1);
    $("#showCaches").prop('checked', load_caches == 1);
    okapi_toggle_load_caches( $('#showCaches').is(':checked') );
    
    //showWelcomePopup();
}

function searchLocation()
{
    var address = $('#txtSearch').val();
    var coords = string2coords(new String(address));
    if (!coords)
    { 
        geocoder.geocode( { address: address, region: 'de' }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            updateLinks();
          } else {
            showAlert( "Information", "Cannot find location of \"%1\".".replace( /%1/, address ) );
          }
        });
    }
    else
    {
        map.setCenter(coords);
        updateLinks();
    }
}

function whereAmI()
{
  if(navigator.geolocation) 
  {
    navigator.geolocation.getCurrentPosition(
      function(position) 
      {
        var loc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        $('#txtSearch').val(coords2string(loc));
        map.setCenter(loc);
        updateLinks();
      }, 
      function() 
      {
        showAlert("Failed to determine current location.");
      }
    );
  }
  else
  {
    showAlert("Failed to determine current location.");
  }
}
