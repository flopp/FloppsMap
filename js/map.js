var markerA;
var markerB;
var lineAB;
var geocoder;

var map;
var copyrightDiv;

function updateProjectionLine()
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

    var path = new google.maps.MVCArray;
    path.push( markerA.getPosition() );
    path.push( markerB.getPosition() );
    lineAB.setPath( path ); 

}

function setCoordinatesA( c )
{
    markerA.setPosition( c );
    updateCoordinates();
}

function setCoordinatesB( c )
{
    markerB.setPosition( c );
    updateCoordinates();
}

function gotoX()
{
    map.setCenter( markerA.getPosition() );
}

function gotoP()
{
    map.setCenter( markerB.getPosition() );
}

function centerX()
{
    setCoordinatesA( map.getCenter() );
}

function centerP()
{
    setCoordinatesB( map.getCenter() );
}

function updateCoordinates() 
{
    pos1 = markerA.getPosition();
    pos2 = markerB.getPosition();
    
    document.getElementById( 'inputCoordinatesA' ).value = coords2string( pos1 );
    document.getElementById( 'inputCoordinatesB' ).value = coords2string( pos2 );
    
    set_cookie('lat1', pos1.lat());
    set_cookie('lon1', pos1.lng());
    
    set_cookie('lat2', pos2.lat());
    set_cookie('lon2', pos2.lng());
    
    var da = dist_angle_geodesic( pos1, pos2 );
    
    document.getElementById( 'txtDistance' ).value = da.dist.toFixed();
    document.getElementById( 'txtBearing' ).value = da.angle.toFixed( 1 );

    updateProjectionLine();
}

function storeCenter()
{
    c = map.getCenter();
    set_cookie( 'clat', c.lat() );
    set_cookie( 'clon', c.lng() );
}

function storeZoom()
{
    set_cookie( 'zoom', map.getZoom() );
}

function projectionXP()
{
    angle = parseFloat( document.getElementById( 'txtProjectionBearing' ).value );
    dist = parseFloat( document.getElementById( 'txtProjectionDistance' ).value );
    if( isNaN( angle ) || angle < 0 || angle > 360 || isNaN( dist ) || dist < 0 )
    {
        alert( "Wegpunktprojektion: Winkel und/oder Distanz ungültig!" );
        return;
    }
    
    markerB.setPosition( projection_geodesic( markerA.getPosition(), angle, dist ) );
    
    updateCoordinates();    
}

function updateCopyrights() 
{
	if( copyrightDiv == null )
	{
		return;
	}
	
	newMapType = map.getMapTypeId();
	set_cookie( 'maptype', newMapType );
    
	if( newMapType == "OSM" )
	{
		copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>";
	}
	else if( newMapType == "OSM/DE" )
	{
		copyrightDiv.innerHTML = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>";
	}
	else
	{
		copyrightDiv.innerHTML = "";
	}
}

function showWelcomePopup()
{
    var welcome= get_cookie('welcome') != null ? parseInt(get_cookie('welcome')) : ( 0 );
    
    var currentwelcome = 5;
    
    if( welcome < currentwelcome )
    {
        $('#welcomeDialog').modal( {show: true});
    }
    
    set_cookie( 'welcome', currentwelcome );
}

function showPermalinkDialog()
{
    pos1 = markerA.getPosition();
    pos2 = markerB.getPosition();
    posc = map.getCenter();
    zoom = map.getZoom();
    
    var s = "http://foomap.de/index.html?lat1=" + pos1.lat() + "&lon1=" + pos1.lng() + "&lat2=" + pos2.lat() + "&lon2=" + pos2.lng() + "&clat=" + posc.lat() + "&clon=" + posc.lng() + "&zoom=" + zoom + "&map=" + map.getMapTypeId();
    $('#permalinkDialogEdit').val(s);
    $('#permalinkDialog').modal( {show: true} );
}

function initialize( ok, xlat1, xlon1, xlat2, xlon2, xclat, xclon, xzoom, xmap )
{
    var lat1, lon1;
    var lat2, lon2;
    var clat, clon;
    var zoom;
    var maptype;
    
    if( typeof(ok) === 'undefined' ) a = false;
    
    if( ok )
    {
        /* load values from parameters */
        lat1 = xlat1;
        lon1 = xlon1;
        
        lat2 = xlat2;
        lon2 = xlon2;
        
        clat = xclat;
        clon = xclon;
        
        zoom = xzoom;
        maptype = xmap;
    }
    else
    {
        /* try to read coordinats from cookie */
        lat1 = get_cookie('lat1') != null ? parseFloat(get_cookie('lat1')) : ( 48.0+0.356/60.0 );
        lon1 = get_cookie('lon1') != null ? parseFloat(get_cookie('lon1')) : ( 7.0+50.832/60.0 );
        lat2 = get_cookie('lat2') != null ? parseFloat(get_cookie('lat2')) : ( 48.0+1.504/60.0 );
        lon2 = get_cookie('lon2') != null ? parseFloat(get_cookie('lon2')) : ( 7.0+51.841/60.0 );
        clat = get_cookie('clat') != null ? parseFloat(get_cookie('clat')) : ( 0.5*(lat1+lat2) );
        clon = get_cookie('clon') != null ? parseFloat(get_cookie('clon')) : ( 0.5*(lon1+lon2) );
        zoom = get_cookie('zoom') != null ? parseInt(get_cookie('zoom')) : 12;
        maptype = get_cookie('maptype') != null ? get_cookie('maptype') : "OSM";
    }
    
    var center = new google.maps.LatLng( clat, clon);    
    var myOptions = {
        zoom: zoom,
        center: center,
        scaleControl: true,
        mapTypeControlOptions: { mapTypeIds: ['OSM', 'OSM/DE', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN] },
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
    map.mapTypes.set("OSM", osm_type );
    map.mapTypes.set("OSM/DE", osmde_type );
    
    
    map.setMapTypeId( maptype );
    
    // Create div for showing copyrights.
	copyrightDiv = document.createElement("div");
	copyrightDiv.id = "map-copyright";
	copyrightDiv.style.fontSize = "11px";
	copyrightDiv.style.fontFamily = "Arial, sans-serif";
	copyrightDiv.style.margin = "0 2px 2px 0";
	copyrightDiv.style.whiteSpace = "nowrap";
	copyrightDiv.style.background = "#FFFFFF";
	map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(copyrightDiv);    
    
    var location1 = new google.maps.LatLng(lat1, lon1);
    var location2 = new google.maps.LatLng(lat2, lon2);
    map.setCenter(center, zoom);

    markerA = new google.maps.Marker( {
        position: location1, 
        map: map,
        icon: new google.maps.MarkerImage( "img/green.png"), 
        draggable: true } );
    
    google.maps.event.addListener( markerA, "drag", function() { updateCoordinates(); } );        
    google.maps.event.addListener( markerA, "dragend", function() { updateCoordinates(); } );      
    
        
    markerB = new google.maps.Marker( {
        position: location2, 
        map: map,
        icon: new google.maps.MarkerImage( "img/red.png"), 
        draggable: true } );
        
    google.maps.event.addListener( markerB, "drag", function() { updateCoordinates(); } );        
    google.maps.event.addListener( markerB, "dragend", function() { updateCoordinates(); } );      

    google.maps.event.addListener( map, "center_changed", function() { storeZoom(); storeCenter(); } );
    google.maps.event.addListener( map, "zoom_changed", function() { storeZoom(); storeCenter(); } );
    google.maps.event.addListener( map, "maptypeid_changed", function(){ updateCopyrights()});
    
    geocoder = new google.maps.Geocoder();
    
    updateCoordinates();
    updateCopyrights();
    
    
    showWelcomePopup();
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
        
        geocoder.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
          } else {
            alert('Suche nach ' + address + ' war nicht erfolgreich: ' + status);
          }
        });
    }
    else
    {
        //console.log( "ok: coordinates" );
        map.setCenter( coords, 13 );
    }
}
