var okapi_keys = {
    "Opencaching.DE" : "YSqPufH82encfJ67ZxV2",
    "Opencaching.PL" : "jhRyc6rGmT6XEvxva29B",
    "Opencaching.NL" : "gcwaesuq3REu8RtCgLDj",
    "Opencaching.US" : "GvgyCMvwfH42GqJGL494",
    "Opencaching.ORG.UK" : "7t7VfpkCd4HuxPabfbHd"
};
    
var okapi_sites = null;

function okapi_setup_sites()
{
    if( okapi_sites != null )
    {
        console.log( "okapi_sites already initialized" );
        return;
    }
    
    okapi_sites = {};
    
    var okapi_main_url = "http://www.opencaching.pl/okapi/services/apisrv/installations";
    
    $.ajax({
        url: okapi_main_url,
        dataType: 'json',
        success: function(response) {
            for( index in response )
            {
                var site = response[index];
                if( site.site_name in okapi_keys )
                {
                    console.log( "adding OC site: " + site.site_name );
                    var data = {
                        siteid: index,
                        name: site.site_name,
                        site_url: site.site_url,
                        url: site.okapi_base_url,
                        key: okapi_keys[site.site_name],
                        markers: {},
                        finished: true
                    };
                    
                    okapi_sites[index] = data;
                }
                else
                {
                    console.log( "skipping OC site (no key): " + site.site_name );
                }
            }
        }
    });
}

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

function okapi_register_popup2( m, code, siteid )
{
    google.maps.event.addListener( m, 'click', function() {
        if( okapi_popup == null )
        {
            okapi_popup = new google.maps.InfoWindow();
        }
        
        var okapi_url = okapi_sites[siteid].url;
        var okapi_key = okapi_sites[siteid].key;
            
        $.ajax({
            url: okapi_url + 'services/caches/geocache',
            dataType: 'json',
            data: {
                'consumer_key': okapi_key,
                'cache_code': code,
                'fields' : 'name|type|url|owner|founds|size2|difficulty|terrain'
            },
            success: function(response) {
                var content = 
                    '<a href="' + response.url + '" target="_blank">' + code + '</a> (' + response.type +')<br />'
                    + '<b><i>' + response.name + '</i></b><br />'
                    + 'by <a href="' + response.owner.profile_url + '" target="_blank"><i>' + response.owner.username + '</i></a><br />'
                    + 'size: <i>' + response.size2 + '</i> diff.: <i>' + response.difficulty + '/5</i> terr.: <i>' + response.terrain + '/5</i><br />'
                    + '#found: <i>' + response.founds + '</i>';
                     
                okapi_popup.setContent( content );
                okapi_popup.open( map, m );
            }
        });
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
    for( var siteid in okapi_sites )
    {
        okapi_remove_caches_site( okapi_sites[siteid].markers );
    }
}


function okapi_load_caches_bbox_site( siteid )
{
    var site = okapi_sites[siteid];
    
    if( !okapi_load_caches_enabled )
    {
        site.finished = true;
        return;
    }
    
    var site = okapi_sites[siteid];
    
    if( !site.finished )
    {
        return;
    }
    
    site.finished = false;
    
    var b = map.getBounds();
    var bbox = b.getSouthWest().lat() + "|" + b.getSouthWest().lng() + "|" + b.getNorthEast().lat() + "|" + b.getNorthEast().lng();
    
    $.ajax({
        url: site.url + 'services/caches/shortcuts/search_and_retrieve',
        dataType: 'json',
        data: {
            'consumer_key': site.key,
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
                if( cache.code in site.markers ) 
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
                
                site.markers[cache.code] = m;
                okapi_register_popup2( m, cache_code, siteid );
            }
            
            for( m in site.markers )
            {
                if( !( m in addedCaches ) )
                {
                    site.markers[m].setMap(null);
                    delete( site.markers[m] );
                }
            }
            site.finished = true;
        },
        error: function() {
            console.log( "okapi request failed: " + site.name );
            okapi_remove_caches_site( site.markers );
            site.finished = true;
        }
    });
}

function okapi_load_caches_bbox()
{
    for( var siteid in okapi_sites )
    {
        okapi_load_caches_bbox_site( siteid );
    }
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
