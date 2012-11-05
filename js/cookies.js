function set_cookie( c_key, c_val ) 
{
    // cookie expires in 30 days
    var dt = new Date();
    dt.setTime( dt.getTime() + ( 30 * 24 * 60 * 60 * 1000 ) );
    
    var c = c_key + '=' + c_val + '; expires=' + dt.toGMTString() + '; path=/';
    document.cookie = c;
}

function get_cookie( c_key ) 
{
    var cookies = document.cookie.split( ';' );
    var eq_pos, x, y;
    
    for( var i = 0; i < cookies.length; i++ ) 
    {
        // find '='
        eq_pos = cookies[i].indexOf( '=' );
        
        // extract key
        x = cookies[i].substr( 0, eq_pos );
        x = x.replace( /^\s+|\s+$/g, '' );
        
        // check if key matches
        if( x == c_key )
        {
            // extract value
            y = cookies[i].substr( eq_pos + 1 );
            y = y.replace( /^\s+|\s+$/g, '' );
            
            return y;
        }
    }
    
    return null;
}
