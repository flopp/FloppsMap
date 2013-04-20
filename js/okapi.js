var ocde_okapi_url = "http://www.opencaching.de/okapi";
var ocde_okapi_key = "YSqPufH82encfJ67ZxV2";

var okapi_request_finished = true;
var okapi_markers = null;
var okapi_popup = null;

function okapi_register_popup( m, contentString )
{
    google.maps.event.addListener( m, 'click', function() {
        if( okapi_popup == null )
        {
            okapi_popup = new google.maps.InfoWindow();
        }
        
        okapi_popup.setContent(contentString);
        okapi_popup.open( map, m );
    });
}

function removeCaches()
{
    if( okapi_markers != null )
    {
        for( var i = 0; i < okapi_markers.length; i++ ) 
        {
            okapi_markers[i].setMap(null);
        }
    }
    okapi_markers = [];
}

function getCachesBBOX() 
{
    if( !okapi_request_finished )
    {
        return;
    }
    
    okapi_request_finished = false;
        
    var b = map.getBounds();
    var bbox = b.getSouthWest().lat() + "|" + b.getSouthWest().lng() + "|" + b.getNorthEast().lat() + "|" + b.getNorthEast().lng();
    
    $.ajax({
        url: ocde_okapi_url + '/services/caches/shortcuts/search_and_retrieve',
        dataType: 'json',
        data: {
            'consumer_key': ocde_okapi_key,
            'search_method': 'services/caches/search/bbox',
            'search_params': '{"bbox" : "' + bbox + '", "limit" : "500"}',
            'retr_method': 'services/caches/geocaches',
            'retr_params': '{"fields": "code|name|location|url"}',
            'wrap': 'false'
        },
        success: function(response) {
            removeCaches();
            
            for( var cache_code in response ) {
                var cache = response[cache_code];
                var loc = cache.location.split("|");
                var c = new google.maps.LatLng( parseFloat( loc[0] ), parseFloat( loc[1] ) );
                var m = new google.maps.Marker( {
                    position: c, 
                    map: map
                });
                okapi_markers.push( m );
                
                var content = '<a href="' + cache.url + '">' + cache.code + '</a><br />'+cache.name;
                okapi_register_popup( m, content );
                
            }
            okapi_request_finished = true;
        },
        error: function() {
            console.log( "okapi request failed!" );
            removeCaches();
            okapi_request_finished = true;
        }
    });
}

