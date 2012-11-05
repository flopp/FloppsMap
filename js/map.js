var marker;
var projection_marker;
var projection_line;
var geocoder;

var map;
var copyrightDiv;

function updateProjectionLine()
{
    if( !projection_line )
    {   
        projection_line = new google.maps.Polyline( { 
            strokeColor: '#ff0000', 
            strokeWeight: 2, 
            strokeOpacity: 0.7, 
            geodesic: true } );
        projection_line.setMap( map );
    }

    var path = new google.maps.MVCArray;
    path.push( marker.getPosition() );
    path.push( projection_marker.getPosition() );
    projection_line.setPath( path ); 

}

function gotoX()
{
    map.setCenter( marker.getPosition() );
}

function gotoP()
{
    map.setCenter( projection_marker.getPosition() );
}

function centerX()
{
    marker.setPosition( map.getCenter() );
    updateCoordinates();
}

function centerP()
{
    projection_marker.setPosition( map.getCenter() );
    updateCoordinates();
}

function updateCoordinates() 
{
    pos1 = marker.getPosition();
    pos2 = projection_marker.getPosition();
    
    document.getElementById( 'txtX' ).value = coords2string( pos1 );
    document.getElementById( 'txtP' ).value = coords2string( pos2 );
    
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
    
    projection_marker.setPosition( projection_geodesic( marker.getPosition(), angle, dist ) );
    
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
    
    var currentwelcome = 1;
    
    if( welcome < currentwelcome )
    {
        $('#welcomeDialog').modal( {show: true});
    }
    
    set_cookie( 'welcome', currentwelcome );
}

function initialize()
{
    /* try to read coordinats from cookie */
    var lat1 = get_cookie('lat1') != null ? parseFloat(get_cookie('lat1')) : ( 48.0+0.356/60.0 );
    var lon1 = get_cookie('lon1') != null ? parseFloat(get_cookie('lon1')) : ( 7.0+50.832/60.0 );
    var lat2 = get_cookie('lat2') != null ? parseFloat(get_cookie('lat2')) : ( 48.0+1.504/60.0 );
    var lon2 = get_cookie('lon2') != null ? parseFloat(get_cookie('lon2')) : ( 7.0+51.841/60.0 );
    var clat = get_cookie('clat') != null ? parseFloat(get_cookie('clat')) : ( 0.5*(lat1+lat2) );
    var clon = get_cookie('clon') != null ? parseFloat(get_cookie('clon')) : ( 0.5*(lon1+lon2) );
    var zoom = get_cookie('zoom') != null ? parseInt(get_cookie('zoom')) : 12;
    var maptype = get_cookie('maptype') != null ? get_cookie('maptype') : "OSM";
    
    var center = new google.maps.LatLng( clat, clon);    
    var myOptions = {
        zoom: zoom,
        center: center,
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

    marker = new google.maps.Marker( {
        position: location1, 
        map: map,
        //icon: new google.maps.MarkerImage( "http://www.google.com/mapfiles/markerX.png"), 
        icon: new google.maps.MarkerImage( "img/green.png"), 
        draggable: true } );
    
    google.maps.event.addListener( marker, "drag", function() { updateCoordinates(); } );        
    google.maps.event.addListener( marker, "dragend", function() { updateCoordinates(); } );      
    
        
    projection_marker = new google.maps.Marker( {
        position: location2, 
        map: map,
        //icon: new google.maps.MarkerImage( "http://www.google.com/mapfiles/markerP.png"), 
        icon: new google.maps.MarkerImage( "img/red.png"), 
        draggable: true } );
        
    google.maps.event.addListener( projection_marker, "drag", function() { updateCoordinates(); } );        
    google.maps.event.addListener( projection_marker, "dragend", function() { updateCoordinates(); } );      

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
