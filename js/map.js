var lineAB;
var geocoder;
var sourceid = -1;
var targetid = -1;
var markers = null;
var boundary_layer = null;
var boundary_layer_fusion_table = "1Fg-gWjzai7awzjO30BFP_i_67zaRwrCCoMBRJ5Y"; // GADM.org
//var boundary_layer_fusion_table = "14CNp_bLGOQTmtR-8vMxInDZdtHXvAGE3ZbMrF_w"; // GSAK
var nsgLayer = null;
var nsgLayerShown = false;
var nsgLayerUpdateTimeout = null;
var hillshadingLayer = null;
var hillshadingLayerShown = false;
var map;
var copyrightDiv;

var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var MAPTYPE_DEFAULT = "OSM";
var RADIUS_DEFAULT = 161;

var externalLinkTargets = null;

function setupExternalLinkTargets()
{
    var e = new Array();
    
    e["★ Spiele ★"] = "";
    e["Confluence.org"] = "http://www.confluence.org/confluence.php?lat=%lat%&lon=%lon%";
    e["Geocaching.com"] = "http://coord.info/map?ll=%lat%,%lon%&z=%zoom%";
    e["Geograph"] = "http://geo.hlipp.de/ommap.php?z=%zoom%&t=g&ll=%lat%,%lon%";
    e["Ingress.com"] = "http://www.ingress.com/intel?latE6=%late6%&lngE6=%lone6%&z=%zoom%";
    e["Lacita.org"] = "http://www.lacita.org/cgi_bin/bf.pl?Path=00&lat=%lat%&lng=%lon%&z=%zoom%";
    e["Munzee (da-fi.de)"] = "http://da-fi.de/public/munzee/bbmap2.php?lat=%lat%&lon=%lon%&zoom=%zoom%";
    e["Nachtcaches.de"] = "http://nachtcaches.de/#%lat%,%lon%,%zoom%";
    e["Opencaching.de"] = "http://www.opencaching.de/map2.php?lat=%lat%&lon=%lon%&zoom=%zoom%";
    e["Waymarking.com"] = "http://www.waymarking.com/wm/search.aspx?f=1&lat=%lat%&lon=%lon%";
    
    e["★ Karten ★"] = "";
    e["Bing Maps"] = "http://www.bing.com/maps/?v=2&cp=%lat%~%lon%&lvl=%zoom%";
    e["Cloudmade"] = "http://maps.cloudmade.com/?lat=%lat%&lng=%lon%&zoom=%zoom%";
    e["Google Maps"] = "https://maps.google.com/maps?ll=%lat%,%lon%&z=%zoom%";
    e["OpenStreetMap"] = "http://www.openstreetmap.org/?lat=%lat%&lon=%lon%&zoom=%zoom%";
    e["OpenCycleMap"] = "http://www.opencyclemap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%";
    e["ÖPNV-Karte"] = "http://www.öpnvkarte.de/?zoom=%zoom%&lat=%lat%&lon=%lon%";
    e["Wheelmap.org"] = "http://wheelmap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%";
    e["Wikimapia.org"] = "http://wikimapia.org/#lat=%lat%&lon=%lon%&z=%zoom%";
    e["YAPIS"] = "http://yapis.eu/?id=9&lat=%lat%&lon=%lon%&zoom=%zoom%";
    
    for( index in e ) 
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

function updateDistance()
{
    if( sourceid == -1 || targetid == -1 )
    {
        if( lineAB != null )
        {
            lineAB.setMap( null );
            lineAB = null;
        }
        
        $( '#txtDistance' ).html( "n/a" );
        $( '#txtBearing' ).html( "n/a" );
    }
    else
    {
        if( !lineAB )
        {   
            lineAB = new google.maps.Polyline( { 
                strokeColor: '#ff0000', 
                strokeWeight: 2, 
                strokeOpacity: 0.7, 
                geodesic: true } );
            lineAB.setMap( map );
        }
        
        var m1 = markers[sourceid];
        var m2 = markers[targetid];
        
        var path = new google.maps.MVCArray;
        path.push( m1.marker.getPosition() );
        path.push( m2.marker.getPosition() );
        lineAB.setPath( path ); 
        
        var da = dist_angle_geodesic( m1.marker.getPosition(), m2.marker.getPosition() );
        
        $('#txtDistance').html( da.dist.toFixed() );
        if( da.dist.toFixed() == 0 )
        {
            $('#txtBearing').html( "n/a" );
        }
        else
        {
            $('#txtBearing').html( da.angle.toFixed( 1 ) );
        }
    }
}

function updateMarker( m )
{
    var pos = m.marker.getPosition();
    var r = m.circle.getRadius();
    
    m.circle.setCenter( pos );
    
    set_cookie( 'marker' + m.id, pos.lat().toFixed(6) + ":" + pos.lng().toFixed(6) + ":" + r );
    $('#coordinates' + m.alpha ).val( coords2string( pos ) ); 
    $('#radius' + m.alpha ).val( r );
    
    if( m.id == sourceid || m.id == targetid )
    {
        updateDistance();
    }
    
    updateLinks();
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

function selectSourceById( id )
{
    if( id != sourceid )
    {
        sourceid = id;
        updateDistance();
        set_cookie( 'source', id );
        $("#sourcelist > option[value=" + id + "]").attr("selected", "selected");
    }
}

function selectTargetById( id )
{
    if( id != targetid )
    {
        targetid = id;
        updateDistance();
        set_cookie( 'target', id );
        $("#targetlist > option[value=" + id + "]").attr("selected", "selected");
    }
}

function selectSource()
{
    var opt = $("#sourcelist option:selected");
    if( opt )
    {
        selectSourceById( opt.val() );
    }
    else
    {
        selectSourceById( -1 );
    }
}

function selectTarget()
{
    var opt = $("#targetlist option:selected");
    if( opt )
    {
        selectTargetById( opt.val() );
    }
    else
    {
        selectTargetById( -1 );
    }
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

function updateLists()
{
    var lst = "";
    
    $("#sourcelist").empty();
    $("#targetlist").empty();
    
    $('#sourcelist').append('<option value="-1">?</option>');
    $('#targetlist').append('<option value="-1">?</option>');

    for( var i = 0; i < markers.length; ++i )
    {
        var m = markers[i];
        if( !m.free )
        {   
            $('#sourcelist').append('<option value="'+m.id+'">'+m.alpha+'</option>');
            $('#targetlist').append('<option value="'+m.id+'">'+m.alpha+'</option>');
            lst = lst + ":" + m.id;
        }
    }
    
    $("#sourcelist > option[value=" + sourceid + "]").attr("selected", "selected");
    $("#targetlist > option[value=" + targetid + "]").attr("selected", "selected");
    
    set_cookie( 'markers', lst );
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
    
    var parent = document.getElementById("dynMarkerDiv");
    var div = document.getElementById("dyn" + m.id );
    parent.removeChild( div );
    
    if( visibleMarkers() == 0 )
    {
        $('#btnnewmarker2').hide();
    }
    
    if( id == sourceid )
    {
        set_cookie( 'source', -1 );
        
        $('#sourcebtn').html( "?" );
        sourceid = -1;
    }
    if( id == targetid )
    {
        set_cookie( 'target', id );
        
        $('#targetbtn').html( "?" );
        targetid = -1;
    }
    updateLists();
    updateDistance();
    updateLinks();
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

function toggleOkButton( id, t )
{
    if( t ) 
    {
        $(id).removeClass("disabled");
        $(id).removeClass("btn-inverse");
        $(id).addClass("btn-success");
    }
    else
    {
        $(id).removeClass("btn-success");
        $(id).addClass("disabled");
        $(id).addClass("btn-inverse");
    }
}

function toggleCancelButton( id, t )
{
    if( t ) 
    {
        $(id).removeClass("disabled");
        $(id).removeClass("btn-inverse");
        $(id).addClass("btn-danger");
    }
    else
    {
        $(id).removeClass("btn-danger");
        $(id).addClass("disabled");
        $(id).addClass("btn-inverse");
    }
}
function newMarker( coordinates, theid, radius )
{
    if( radius < 0 ) radius = RADIUS_DEFAULT;
    
    var id = theid;
    if( id == -1 || id < 0 || id >= 26 || markers[id].free == true ) id = getFreeId();
    if( id == -1 )
    {
        showAlert( "Fehler", "Es sind keine weiteren Marker verfügbar." );
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
    
    // base.png is 7x4 icons (each: 32px x 37px)
    var iconw = 32;
    var iconh = 37;
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

    var parent = document.getElementById("dynMarkerDiv");
    var div = document.createElement("div" );
    div.setAttribute( "id", "dyn" + m.id );
    div.innerHTML = "<div>" +
    "<div style=\"white-space: nowrap; height: "+iconh+"px; padding-top: 12px; padding-bottom: 4px; width: 236px\">"+
    "<span style=\"width:"+iconw+"px; height:"+iconh+"px; float: left; display: block; background-image: url(img/base.png); background-repeat: no-repeat; background-position: -"+offsetx+"px -"+offsety+"px;\">&nbsp;</span><div class=\"btn-group\" style=\"padding-bottom: 2px; padding-top: 2px; float: right\">" +
    "<button class=\"btn btn-danger\" title=\"Entferne Marker\" type=\"button\" onClick=\"removeMarker(" + m.id + ")\"><i class=\"icon-trash\"></i></button>" +
    "<button class=\"btn btn-info\" title=\"Bewege Karte zu Marker\" type=\"button\" onClick=\"gotoMarker(" + m.id + ")\"><i class=\"icon-search\"></i></button>" +
    "<button class=\"btn btn-warning\" title=\"Setze Marker auf Kartenmitte\" type=\"button\" onClick=\"centerMarker(" + m.id + ")\"><i class=\"icon-screenshot\"></i></button>" +
    "<button class=\"btn btn-success\" title=\"Projektion ausgehend vom Marker\" type=\"button\" onClick=\"projectFromMarker(" + m.id + ")\"><i class=\"icon-arrow-right\"></i></button>" +
    "</div></div></div>" +
    "<div class=\"input-append\">" + 
    "<input id=\"coordinates" + m.alpha +"\" style=\"width: 173px\" type=\"text\" title=\"Koordinaten des Markers\" placeholder=\"Koordinaten\" value=\"n/a\" >" +
    "<button id=\"btnCancelCoords" + m.alpha + "\" class=\"btn btn-inverse disabled\" type=\"submit\" style=\"width: 27px; padding-left: 4px; padding-right: 4px\" type=\"button\"><i class=\"icon-remove\"></i></button>" +
    "<button id=\"btnOkCoords" + m.alpha + "\" class=\"btn btn-inverse disabled\" type=\"submit\" style=\"width: 24px; padding-left: 4px; padding-right: 4px\" type=\"button\"><i class=\"icon-ok\"></i></button>" +
    "</div>" +
    "<div class=\"input-prepend input-append\">" +
    "<span class=\"add-on\" style=\"width: 24px; padding-left: 4px; padding-right: 4px\"><i class=\"icon-circle-blank\"></i></span>" +
    "<input id=\"radius" + m.alpha +"\" style=\"width: 142px\" type=\"text\" title=\"Radius (m) der Kreises um den Marker\" placeholder=\"Radius (m)\" value=\"n/a\" >" +
    "<button id=\"btnCancelRadius" + m.alpha + "\" class=\"btn btn-inverse disabled\" type=\"submit\" style=\"width: 27px; padding-left: 4px; padding-right: 4px\" type=\"button\"><i class=\"icon-remove\"></i></button>" +
    "<button id=\"btnOkRadius" + m.alpha + "\" class=\"btn btn-inverse disabled\" type=\"submit\" style=\"width: 24px; padding-left: 4px; padding-right: 4px\" type=\"button\"><i class=\"icon-ok\"></i></button>" +
    "</div>";
    
    if( nextid == markers.length )
    {
        parent.appendChild( div );
    }
    else
    {
        var nextdiv = document.getElementById( "dyn" + nextid );
        parent.insertBefore( div, nextdiv );
    }
    
    /* coordinates */
    function editCoordinates() {
        toggleCancelButton( '#btnCancelCoords' + m.alpha, true );
        toggleOkButton( '#btnOkCoords' + m.alpha, true );
    }
    
    function cancelCoordinates() {
        updateMarker( m );
        
        toggleCancelButton( '#btnCancelCoords' + m.alpha, false );
        toggleOkButton( '#btnOkCoords' + m.alpha, false );
    }
    
    function acceptCoordinates() {
        var s = $('#coordinates' + m.alpha).val();
        var rr = string2coords( s );
        
        if( rr == null )
        {
            showAlert( "Fehler", "Ungültiges Koordinatenformat: \"%1\".".replace( /%1/, s ) );
        }
        else
        {
            toggleCancelButton( '#btnCancelCoords' + m.alpha, false );
            toggleOkButton( '#btnOkCoords' + m.alpha, false );
            
            m.marker.setPosition( rr );
            updateMarker( m );
        }
    }
    
    $('#coordinates' + m.alpha).bind('blur paste', editCoordinates );
    $('#coordinates' + m.alpha).keydown(function(e){
        if(e.which == 27) { cancelCoordinates(); }
        else if(e.which == 13) { acceptCoordinates(); }
        else { editCoordinates(); }
    });
    $('#btnCancelCoords' + m.alpha).click( cancelCoordinates );
    $('#btnOkCoords' + m.alpha).click( acceptCoordinates );
    
    /* radius */
    function editRadius() {
        toggleCancelButton( '#btnCancelRadius' + m.alpha, true );
        toggleOkButton( '#btnOkRadius' + m.alpha, true );
    }
    
    function cancelRadius() {
        updateMarker( m );
        
        toggleCancelButton( '#btnCancelRadius' + m.alpha, false );
        toggleOkButton( '#btnOkRadius' + m.alpha, false );
    }
    
    function acceptRadius() {
        var s = $('#radius' + m.alpha).val();
        var rr = getInteger( s, 0, 100000000000 );
        if( rr == null )
        {
            showAlert( "Fehler", "Ungültiger Wert für den Radius: \"%1\".<br />Erlaubt sind ganzzahlige Werte größer gleich 0.".replace( /%1/, s ) );
        }
        else
        {
            toggleCancelButton( '#btnCancelRadius' + m.alpha, false );
            toggleOkButton( '#btnOkRadius' + m.alpha, false );
            
            setRadius( m, rr );
            updateMarker( m );
        }
    }
    
    $('#radius' + m.alpha).bind('blur paste', editRadius );
    $('#radius' + m.alpha).keydown(function(e){
        if(e.which == 27) { cancelRadius(); }
        else if(e.which == 13) { acceptRadius(); }
        else { editRadius(); }
    });
    $('#btnCancelRadius' + m.alpha).click( cancelRadius );
    $('#btnOkRadius' + m.alpha).click( acceptRadius );
    
    $('#btnnewmarker2').show();
    
    updateMarker( m );
    updateLists();
    updateLinks();
    
    return m;
}

function projectFromMarker( id )
{
    var mm = getMarkerById( id );
    var oldpos = mm.marker.getPosition();
    
    showDoubleInputDialog( 
        "Wegpunktprojektion", 
        "Projektionswinkel in ° (0-360)",
        0,
        "Projektionsdistanz in Metern (>0)",
        0, 
        function(data1, data2)
        {
            var angle = getFloat( data1, 0, 360 );
            var dist = getFloat( data2, 0, 100000000000 );
            
            if( angle == null )
            {
                showAlert( "Fehler", "Ungültiger Wert für den Projektionswinkel: \"%1\".<br />Erlaubt sind Fließkommazahlen größer gleich 0 und kleiner 360.".replace( /%1/, data1 ) );
                return;
            }
            
            if( dist == null )
            {
                showAlert( "Fehler", "Ungültiger Wert für die Projektionsdistanz: \"%1\".<br />Erlaubt sind Fließkommazahlen größer gleich 0".replace( /%1/, data2 ) );
                return;
            }

            var newpos = projection_geodesic( oldpos, angle, dist );
            var m = newMarker( newpos, -1, RADIUS_DEFAULT );
            if( m != null )
            {
                showAlert( "Information", "Es wurde ein neuer Marker erzeugt: %1.".replace( /%1/, m.alpha ) );
            }        
        }
    );
}

function storeCenter()
{
    c = map.getCenter();
    set_cookie( 'clat', c.lat() );
    set_cookie( 'clon', c.lng() );
    
    updateLinks();
}

function storeZoom()
{
    set_cookie( 'zoom', map.getZoom() );
    
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
    for( i = 0; i != markers.length; ++i )
    {
        var m = markers[i];
        if( m.free ) continue;
        var p = m.marker.getPosition();
        
        s = s + m.alpha + ":" + p.lat().toFixed(6) + ":" + p.lng().toFixed(6) + ":" + m.circle.getRadius() + "*";
    }
    ftklink = "http://www.flopp.net/?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) + "&z=" + zoom + "&t=" + map.getMapTypeId() + s;
    $( "#permalink" ).attr( "href", ftklink );
}

function updateCopyrights() 
{
    if( copyrightDiv == null )
    {
        return;
    }
    
    newMapType = map.getMapTypeId();
    set_cookie( 'maptype', newMapType );
    
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
    else
    {
        copyrightDiv.innerHTML = "";
    }
    
    updateLinks();
}

function showNSGLayer( t )
{
    if( t == nsgLayerShown )
    {
        return;
    }
    
    nsgLayerShown = t;
    $( '#showNSG' ).attr( 'checked', nsgLayerShown );
    set_cookie( 'nsg', nsgLayerShown ? 1 : 0 );
    
    if( nsgLayerShown )
    {
        updateNSGLayer();
    }
    else
    {
        if( nsgLayerUpdateTimeout != null )
        {
            clearTimeout( nsgLayerUpdateTimeout );
            nsgLayerUpdateTimeout = null;
        }
        
        nsgLayer.setMap( null );
        nsgLayer = null;
    }
}

function updateNSGLayer()
{
    if( !nsgLayerShown )
    {
        return;
    }
    
    if( nsgLayerUpdateTimeout != null )
    {
        clearTimeout( nsgLayerUpdateTimeout );
    }
    
    nsgLayerUpdateTimeout = setTimeout( 
        function()
        {
            b = map.getBounds();
            z = map.getZoom();
            
            url = "http://www.nsg-atlas.de/genkml.php?S=" + b.getSouthWest().lat() + "&N=" + b.getNorthEast().lat() + "&W=" + b.getSouthWest().lng() + "&E=" + b.getNorthEast().lng() + "&ZOOM=" + z;
            
            if( nsgLayer == null )
            {
                nsgLayer = new google.maps.KmlLayer(
                    url, 
                    { suppressInfoWindows: false, preserveViewport: true }
                );
                nsgLayer.setMap( map );
            }
            else
            {
                nsgLayer.setUrl( url );
            }
        }, 1000 );
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
    set_cookie( 'hillshading', hillshadingLayerShown ? 1 : 0 );
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
    else if( t == "satellite" || t == "hybrid" || t == "roadmap" || t == "terrain" )
    {
        return t;
    }
    else
    {
        return d;
    }
}

function initialize( xcenter, xzoom, xmap, xmarkers )
{
    var center = null;
    var zoom = parseInt( xzoom );;
    var maptype = xmap;    
    
    markers = new Array();
    for( var i = 0; i != 26; i++ )
    {
        var m = new Object();
        m.id = i;
        m.alpha = String.fromCharCode('A'.charCodeAt()+m.id);
        m.free = true;
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
        
        // ID:COODS:R|ID:COORDS:R
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
            
            var m = new Object();
            
            m.alpha = data2[0];
            m.id = null;
            if( m.alpha.length != 1 ) continue;
            if( m.alpha[0] >= 'A' && m.alpha[0] <= 'Z' ) m.id = m.alpha.charCodeAt(0) - 'A'.charCodeAt(0); 
            if( m.alpha[0] >= 'a' && m.alpha[0] <= 'z' ) m.id = m.alpha.charCodeAt(0) - 'a'.charCodeAt(0); 
            if( m.id == null || m.id < 0 || m.id >= 26 ) continue;
            
            // LAT:LON
            if( data2.length == 4 )
            {
                var lat = parseFloat( data2[1] );
                if( lat < -90 || lat > 90 ) continue;
                var lon = parseFloat( data2[2] );
                if( lon < -180 || lon > 180 ) continue; 
                
                var r = parseFloat( data2[3] );
                if( r < 0 || r > 100000000000 ) continue;
                
                m.coords = new google.maps.LatLng( lat, lon );
                m.r = r;
            }
            // DEG, DMMM, ...
            else if( data2.length == 3 )
            {                
                m.coords = string2coords( data2[1] ); 
                if( m.coords == null ) continue;
                
                var r = parseFloat( data2[2] );
                if( r < 0 || r > 100000000000 ) continue;
                
                m.r = r;
            }
            else
            {
                continue;
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
        clat = get_cookie('clat') != null ? parseFloat(get_cookie('clat')) : CLAT_DEFAULT;
        clon = get_cookie('clon') != null ? parseFloat(get_cookie('clon')) : CLON_DEFAULT;
        clat = repairLat( clat, CLAT_DEFAULT );
        clon = repairLon( clon, CLON_DEFAULT );
        center = new google.maps.LatLng( clat, clon );
        
        zoom = get_cookie('zoom') != null ? parseInt(get_cookie('zoom')) : ZOOM_DEFAULT;
        maptype = get_cookie('maptype') != null ? get_cookie('maptype') : MAPTYPE_DEFAULT;        
    }
    
    if( center == null )
    {
        center = new google.maps.LatLng( CLAT_DEFAULT, CLON_DEFAULT );
    }
    
    zoom = repairZoom( zoom, ZOOM_DEFAULT );
    maptype = repairMaptype( maptype, MAPTYPE_DEFAULT );
       
    var nsg = get_cookie('nsg') != null ? parseInt( get_cookie('nsg') ) : 0;
    
    var myOptions = {
        zoom: zoom,
        center: center,
        scaleControl: true,
        mapTypeControlOptions: { mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'MQ', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN] },
        mapTypeId: google.maps.MapTypeId.ROADMAP };
        
    map = new google.maps.Map(document.getElementById("themap"), myOptions);
    
    osm_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { return "http://tile.openstreetmap.org/" + zoom + "/" + coord.x + "/" + coord.y + ".png"; },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM",
        alt: "OpenStreetMap",
        maxZoom: 18 });
    osmde_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { return "http://a.tile.openstreetmap.de/tiles/osmde/" + zoom + "/" + coord.x + "/" + coord.y + ".png"; },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM/DE",
        alt: "OpenStreetMap (german style)",
        maxZoom: 18 });
    ocm_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { return "http://tile.opencyclemap.org/cycle/" + zoom + "/" + coord.x + "/" + coord.y + ".png"; },
        tileSize: new google.maps.Size(256, 256),
        name: "OCM",
        alt: "OpenCycleMap",
        maxZoom: 18 });
    mq_type = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { return "http://otile1.mqcdn.com/tiles/1.0.0/osm/" + zoom + "/" + coord.x + "/" + coord.y + ".png"; },
        tileSize: new google.maps.Size(256, 256),
        name: "MQ",
        alt: "MapQuest (OSM)",
        maxZoom: 19 });
    
    
    map.mapTypes.set("OSM", osm_type );
    map.mapTypes.set("OSM/DE", osmde_type );
    map.mapTypes.set("OCM", ocm_type );
    map.mapTypes.set("MQ", mq_type );
    
    map.setMapTypeId( maptype );
    
    boundary_layer = null;
    //boundary_layer.setMap( map );
    
    hillshadingLayer = new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) { return "http://toolserver.org/~cmarqu/hill/" + zoom + "/" + coord.x + "/" + coord.y + ".png"; },
        tileSize: new google.maps.Size(256, 256),
        name: "hill",
        alt: "Hillshading",
        maxZoom: 17 });
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
   
    google.maps.event.addListener( map, "center_changed", function() { storeZoom(); storeCenter(); updateNSGLayer(); okapi_schedule_load_caches(); } );
    google.maps.event.addListener( map, "zoom_changed", function() { storeZoom(); storeCenter(); updateNSGLayer(); okapi_schedule_load_caches(); } );
    google.maps.event.addListener( map, "maptypeid_changed", function(){ updateCopyrights()});
    
    geocoder = new google.maps.Geocoder();
    
    
    if( loadfromcookies )
    {
        raw_ids = get_cookie('markers');
        if( raw_ids != null )
        {
            ids = raw_ids.split(':');
            for( var i = 0; i != ids.length; ++i )
            {
                var id = parseInt(ids[i]);
                if( id == null || id < 0 || id >=26 ) continue;
                
                var raw_data = get_cookie( 'marker' + id );
                if( raw_data == null ) continue;
                
                var data = raw_data.split(':')
                if( data.length != 3 ) continue;
                
                var lat = parseFloat( data[0] );
                if( lat < -90 || lat > 90 ) continue;
                var lon = parseFloat( data[1] );
                if( lon < -180 || lon > 180 ) continue; 
                var r = parseFloat( data[2] );
                if( r < 0 || r > 100000000000 ) continue; 
                
                newMarker( new google.maps.LatLng( lat, lon ), id, r );
            }
        }
        
        raw_source = get_cookie('source');
        if( raw_source != null )
        {
            var id = parseInt(raw_source);
            if( id != null && id >= 0 && id < 26 && markers[id].free == false )
            {
                selectSourceById( id );
            }
        }
        
        raw_target = get_cookie('target');
        if( raw_target != null )
        {
            var id = parseInt(raw_target);
            if( id != null && id >= 0 && id < 26 && markers[id].free == false )
            {
                selectTargetById( id );
            }
        }
    }
    else
    {
        for( var i = 0; i != markerdata.length; ++i )
        {
            newMarker( markerdata[i].coords, markerdata[i].id, markerdata[i].r );
        }
    }
    
    
    updateDistance();
    
    updateCopyrights();
        
    showNSGLayer( nsg != 0 );
    updateNSGLayer();
    
    toggleHillshadingLayer( true );
    
    setupExternalLinkTargets();
        
    updateLinks();
    
    //showWelcomePopup();
}

function searchLocation()
{
    address = document.getElementById( 'txtSearch' ).value;

    var str = new String( address );
    //console.log( "trying to parse " + address );
    
    var coords = string2coords( str );
    if( !coords )
    { 
        //console.log( "fail: using geocoder" );
        
        geocoder.geocode( { address: address, region: 'de' }, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
          } else {
            showAlert( "Information", "Die Suche nach \"%1\" war nicht erfolgreich.".replace( /%1/, address ) );
          }
        });
    }
    else
    {
        //console.log( "ok: coordinates" );
        map.setCenter( coords, 13 );
        updateLinks();
    }
}
