function string2coords( coordstring )
{
    coordstring = coordstring.trim()

    var matches;
    var pattern;
    
    pattern = /^[^A-Za-z0-9.-]*([ns])[^A-Za-z0-9.-]*(\d+)[^A-Za-z0-9.-]+([\d\.]+)[^A-Za-z0-9.-]+([we])[^A-Za-z0-9.-]*(\d+)[^A-Za-z0-9.-]+([\d\.]+)[^A-Za-z0-9.-]*$/i;
    matches = coordstring.match( pattern );
    if( matches )
    {
        var lat_sign = ( matches[1] == 's' || matches[1] == 'S' ) ? -1 : 1;
        var lng_sign = ( matches[4] == 'w' || matches[4] == 'W' ) ? -1 : 1;
        
        var lat_d = parseFloat( matches[2] );
        var lat_m = parseFloat( matches[3] );
        
        var lon_d = parseFloat( matches[5] );
        var lon_m = parseFloat( matches[6] );

        lat = lat_sign * ( lat_d + ( lat_m / 60.0 ) );
        lng = lng_sign * ( lon_d + ( lon_m / 60.0 ) );
        
        return new google.maps.LatLng( lat, lng );
    }
    
    pattern = /^[^A-Za-z0-9.-]*([ns])[^A-Za-z0-9.-]*([\d\.]+)[^A-Za-z0-9.-]+([we])[^A-Za-z0-9.-]*([\d\.]+)[^A-Za-z0-9.-]*$/i;
    matches = coordstring.match( pattern );
    if( matches )
    {
        var lat_sign = ( matches[1] == 's' || matches[1] == 'S' ) ? -1 : 1;
        var lng_sign = ( matches[3] == 'w' || matches[3] == 'W' ) ? -1 : 1;
        
        var lat = lat_sign * parseFloat( matches[2] );
        var lng = lng_sign * parseFloat( matches[4] );
        
        return new google.maps.LatLng( lat, lng );
    }
    
    pattern = /^[^A-Za-z0-9.-]*(-?)([\d\.]+)[^A-Za-z0-9.-]+(-?)([\d\.]+)[^A-Za-z0-9.-]*$/i;
    matches = coordstring.match( pattern );
    if( matches )
    {
        var lat_sign = ( matches[1] == '-' ) ? -1 : 1;
        var lng_sign = ( matches[3] == '-' ) ? -1 : 1;
        
        var lat = lat_sign * parseFloat( matches[2] );
        var lng = lng_sign * parseFloat( matches[4] );
    
        return new google.maps.LatLng( lat, lng );
    }
    
    return null;
}


function coords2string( coord )
{
    var lat = coord.lat();
    
    var lat_string = "N";
    if( lat < 0 )
    {
        lat_string = "S";
        lat = -lat;
    }
    
    var lat_deg = 0 | lat;
    var lat_rest = lat - lat_deg;
    var lat_min = 0 | ( lat_rest * 60 );
    lat_rest = lat_rest * 60 - lat_min;
    var lat_mmin = 0 | Math.round( lat_rest * 1000 );
    while( lat_mmin >= 1000 )
    {
        lat_mmin -= 1000;
        lat_min += 1;
    }

    lat_string += " ";
    if( lat_deg < 10 ) lat_string += "0";
    lat_string += lat_deg;
    lat_string += " ";
    
    if( lat_min < 10 ) lat_string += "0";
    lat_string += lat_min;
    lat_string += ".";
    
    if( lat_mmin < 10 ) lat_string += "00";
    else if( lat_mmin < 100 ) lat_string += "0";
    lat_string += lat_mmin;
    
    var lng = coord.lng();
    
    var lng_string = "E";
    if( lng < 0 )
    {
        lng_string = "W";
        lng = -lng;
    }
    
    var lng_deg = 0 | lng;
    var lng_rest = lng - lng_deg;
    var lng_min = 0 | ( lng_rest * 60 );
    lng_rest = lng_rest * 60 - lng_min;
    var lng_mmin = 0 | Math.round( lng_rest * 1000 );
    while( lng_mmin >= 1000 )
    {
        lng_mmin -= 1000;
        lng_min += 1;
    }

    lng_string += " ";
    if( lng_deg < 100 ) lng_string += "0";
    if( lng_deg < 10 ) lng_string += "0";
    lng_string += lng_deg;
    lng_string += " ";
    
    if( lng_min < 10 ) lng_string += "0";
    lng_string += lng_min;
    lng_string += ".";
    
    if( lng_mmin < 10 ) lng_string += "00";
    else if( lng_mmin < 100 ) lng_string += "0";
    lng_string += lng_mmin;

    return lat_string + " " + lng_string;
}

function dist_angle_geodesic( startpos, endpos )
{   
    var geod = GeographicLib.Geodesic.WGS84;
    t = geod.Inverse( startpos.lat(), startpos.lng(), endpos.lat(), endpos.lng() );
    
    a = t.azi1;
    if( a < 0 )
    {
        a += 360.0;
    }
      
    return { dist: t.s12, angle: a };
}

function projection_geodesic( startpos, angle, distance )
{
    var geod = GeographicLib.Geodesic.WGS84;
    t = geod.Direct( startpos.lat(), startpos.lng(), angle, distance );
    
    return new google.maps.LatLng( t.lat2, t.lon2 );
}
