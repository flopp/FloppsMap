function coords2string( coord )
{
    lat = coord.lat();
    
    lat_string = "N";
    if( lat < 0 )
    {
        lat_string = "S";
        lat = -lat;
    }
    
    lat_deg = parseInt( lat );
    lat_rest = lat - lat_deg;
    lat_min = parseInt( lat_rest * 60 );
    lat_rest = lat_rest * 60 - lat_min;
    lat_mmin = parseInt( lat_rest * 1000 );

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

    
    lng = coord.lng();
    
    lng_string = "E";
    if( lng < 0 )
    {
        lng_string = "W";
        lng = -lng;
    }
    
    lng_deg = parseInt( lng );
    lng_rest = lng - lng_deg;
    lng_min = parseInt( lng_rest * 60 );
    lng_rest = lng_rest * 60 - lng_min;
    lng_mmin = parseInt( lng_rest * 1000 );

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

function string2coords( coordstring )
{
    var dm_pattern = /([ns])\s*(\d+)°?\s+([\d\.]+)\s+([we])\s*(\d+)°?\s+([\d\.]+)/i;
    matches = coordstring.match( dm_pattern );
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
    
    var d_pattern = /([ns])\s*([\d\.]+)°?\s+([we])\s*([\d\.]+)°?/i;
    matches = coordstring.match( d_pattern );
    if( matches )
    {
        var lat_sign = ( matches[1] == 's' || matches[1] == 'S' ) ? -1 : 1;
		var lng_sign = ( matches[3] == 'w' || matches[3] == 'W' ) ? -1 : 1;
		
		var lat = lat_sign * parseFloat( matches[2] );
		var lng = lng_sign * parseFloat( matches[4] );
	
        return new google.maps.LatLng( lat, lng );
    }

    var dsign_pattern = /(-?)([\d\.]+)°?\s+(-?)([\d\.]+)°?/i;
    matches = coordstring.match( dsign_pattern );
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
