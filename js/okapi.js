var ocde_okapi_url = "http://www.opencaching.de/okapi";
var ocde_okapi_key = "YSqPufH82encfJ67ZxV2";
var ocde_request_finished = true;
var ocde_markers = {};

var ocpl_okapi_url = "http://www.opencaching.pl/okapi";
var ocpl_okapi_key = "jhRyc6rGmT6XEvxva29B";
var ocpl_request_finished = true;
var ocpl_markers = {};

var ocnl_okapi_url = "http://www.opencaching.nl/okapi";
var ocnl_okapi_key = "gcwaesuq3REu8RtCgLDj";
var ocnl_request_finished = true;
var ocnl_markers = {};

var ocuk_okapi_url = "http://www.opencaching.org.uk/okapi";
var ocuk_okapi_key = "7t7VfpkCd4HuxPabfbHd";
var ocuk_request_finished = true;
var ocuk_markers = {};

var ocus_okapi_url = "http://www.opencaching.us/okapi";
var ocus_okapi_key = "GvgyCMvwfH42GqJGL494";
var ocus_request_finished = true;
var ocus_markers = {};

var okapi_popup = null;
var okapi_icon_unknown     = null;
var okapi_icon_traditional = null;
var okapi_icon_multi       = null;
var okapi_icon_virtual     = null;
var okapi_icon_webcam      = null;
var okapi_icon_event       = null;
var okapi_icon_quiz        = null; 
var okapi_icon_math        = null;
var okapi_icon_moving      = null;
var okapi_icon_drivein     = null;

var okapi_load_caches_enabled = false;


function okapi_create_icons()
{
    if( okapi_icon_unknown != null ) return;
    
    okapi_icon_unknown = new google.maps.MarkerImage( 
            "img/caches/cachetype-1.png" );
    okapi_icon_traditional = new google.maps.MarkerImage( 
            "img/caches/cachetype-2.png" );
    okapi_icon_multi = new google.maps.MarkerImage( 
            "img/caches/cachetype-3.png" );
    okapi_icon_virtual = new google.maps.MarkerImage( 
            "img/caches/cachetype-4.png" );
    okapi_icon_webcam = new google.maps.MarkerImage( 
            "img/caches/cachetype-5.png" );
    okapi_icon_event = new google.maps.MarkerImage( 
            "img/caches/cachetype-6.png" );
    okapi_icon_quiz = new google.maps.MarkerImage( 
            "img/caches/cachetype-7.png" );
    okapi_icon_math = new google.maps.MarkerImage( 
            "img/caches/cachetype-8.png" );
    okapi_icon_moving = new google.maps.MarkerImage( 
            "img/caches/cachetype-9.png" );
    okapi_icon_drivein = new google.maps.MarkerImage( 
            "img/caches/cachetype-10.png" );
}

function okapi_get_icon( type )
{
    okapi_create_icons();
    
    if( type == "Other" )
    {
        return okapi_icon_unknown;
    }
    else if( type == "Traditional" )
    {
        return okapi_icon_traditional;
    }
    else if( type == "Multi" )
    {
        return okapi_icon_multi;
    }
    else if( type == "Virtual" )
    {
        return okapi_icon_virtual;
    }
    else if( type == "Webcam" )
    {
        return okapi_icon_webcam;
    }
    else if( type == "Event" )
    {
        return okapi_icon_event;
    }
    else if( type == "Quiz" )
    {
        return okapi_icon_quiz;
    }
    else if( type == "Math/Physics" )
    {
        return okapi_icon_math;
    }
    else if( type == "Moving" )
    {
        return okapi_icon_moving;
    }
    else if( type == "Drive-In" )
    {
        return okapi_icon_drivein;
    }
    else
    {
        //console.log( "unknown type: " + type );
        return okapi_icon_unknown;
    }
}

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

function okapi_remove_caches_site( okapi_markers )
{
    if( okapi_markers != null )
    {
        for( m in okapi_markers )
        {
            okapi_markers[m].setMap(null);
            delete( okapi_markers[m] );
        }
    }
    okapi_markers = {};
}

function okapi_remove_caches()
{
    okapi_remove_caches_site( ocde_markers );
    okapi_remove_caches_site( ocpl_markers );
    okapi_remove_caches_site( ocnl_markers );
    okapi_remove_caches_site( ocuk_markers );
    okapi_remove_caches_site( ocus_markers );
}


function okapi_load_caches_bbox_site( okapi_url, okapi_key, okapi_request_finished, okapi_markers )
{
    if( !okapi_load_caches_enabled )
    {
        okapi_request_finished = true;
        return;
    }
    
    if( !okapi_request_finished )
    {
        return;
    }
    
    okapi_request_finished = false;
    
    var b = map.getBounds();
    var bbox = b.getSouthWest().lat() + "|" + b.getSouthWest().lng() + "|" + b.getNorthEast().lat() + "|" + b.getNorthEast().lng();
    
    $.ajax({
        url: okapi_url + '/services/caches/shortcuts/search_and_retrieve',
        dataType: 'json',
        data: {
            'consumer_key': okapi_key,
            'search_method': 'services/caches/search/bbox',
            'search_params': '{"bbox" : "' + bbox + '", "limit" : "500"}',
            'retr_method': 'services/caches/geocaches',
            'retr_params': '{"fields": "code|name|location|type|status|url"}',
            'wrap': 'false'
        },
        success: function(response) {
            var addedCaches = {};
            
            for( var cache_code in response ) {
                var cache = response[cache_code];
                
                if( cache.status != "Available" ) continue;
                addedCaches[cache.code] = true;
                if( cache.code in okapi_markers ) 
                {
                    continue;
                }
                
                var loc = cache.location.split("|");
                var c = new google.maps.LatLng( parseFloat( loc[0] ), parseFloat( loc[1] ) );
                var m = new google.maps.Marker( {
                    position: c, 
                    map: map,
                    icon: okapi_get_icon( cache.type )
                });
                
                okapi_markers[cache.code] = m;
                
                var content = '<a href="' + cache.url + '" target="_blank">' + cache.code + '</a> (' + cache.type +')<br />'+cache.name;
                okapi_register_popup( m, content );
            }
            
            for( m in okapi_markers )
            {
                if( !( m in addedCaches ) )
                {
                    okapi_markers[m].setMap(null);
                    delete( okapi_markers[m] );
                }
            }
            okapi_request_finished = true;
        },
        error: function() {
            console.log( "okapi request failed!" );
            okapi_remove_caches();
            okapi_request_finished = true;
        }
    });
}

function okapi_load_caches_bbox()
{
    okapi_load_caches_bbox_site( ocde_okapi_url, ocde_okapi_key, ocde_request_finished, ocde_markers );
    okapi_load_caches_bbox_site( ocpl_okapi_url, ocpl_okapi_key, ocpl_request_finished, ocpl_markers );
    okapi_load_caches_bbox_site( ocnl_okapi_url, ocnl_okapi_key, ocnl_request_finished, ocnl_markers );
    okapi_load_caches_bbox_site( ocuk_okapi_url, ocuk_okapi_key, ocuk_request_finished, ocuk_markers );
    okapi_load_caches_bbox_site( ocus_okapi_url, ocus_okapi_key, ocus_request_finished, ocus_markers );
}

var okapi_load_timer = null;
function okapi_unschedule_load_caches()
{
    if( okapi_load_timer != null )
    {
        window.clearTimeout( okapi_load_timer );
        okapi_load_timer = null;
    }
}

function okapi_schedule_load_caches()
{
    okapi_unschedule_load_caches();
    okapi_load_timer = window.setTimeout( 'okapi_load_caches_bbox()', 500 );
}

function okapi_toggle_load_caches( t )
{
    if( okapi_load_caches_enabled != t )
    {
        okapi_load_caches_enabled = t;
        
        if( okapi_load_caches_enabled )
        {
            okapi_schedule_load_caches();
        }
        else
        {
            okapi_unschedule_load_caches();
            okapi_remove_caches();
        }
    }
}
