var okapi_keys = {
    "Opencaching.DE" : "YSqPufH82encfJ67ZxV2",
    "Opencaching.PL" : "jhRyc6rGmT6XEvxva29B",
    "Opencaching.NL" : "gcwaesuq3REu8RtCgLDj",
    "Opencaching.US" : "GvgyCMvwfH42GqJGL494",
    "Opencaching.ORG.UK" : "7t7VfpkCd4HuxPabfbHd",
    "Opencaching.RO" : "gqSWmVJhZGDwc4sRhyy7"
};

var okapi_ready = false;
var okapi_sites = null;

var okapi_popup = null;
var okapi_icons = null;

var okapi_show_cache = null;
var okapi_show_cache_marker = null;

var okapi_load_caches_enabled = false;


function okapi_setup_sites()
{
    if( okapi_sites != null )
    {
        //console.log( "okapi_sites already initialized" );
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
                        ignore_user: null,
                        markers: {},
                        finished: true
                    };

                    okapi_sites[index] = data;
                }
                //else
                //{
                //  console.log( "skipping OC site (no key): " + site.site_name );
                //}
            }

            okapi_ready = true;

            if( okapi_load_caches_enabled )
            {
                okapi_schedule_load_caches( true );
            }
            
            if (okapi_show_cache != null && okapi_show_cache != "") {
                okapi_center_map_on_cache(okapi_show_cache);
                okapi_show_cache = null;
            }
        }
    });
}


function load_icon( url )
{
    return new google.maps.MarkerImage( url );
}

function okapi_create_icons()
{
    if( okapi_icons != null ) return;
    okapi_icons = {};
    var base = "img/";

    okapi_icons["Other"] = load_icon( base + "cachetype-1.png" );
    okapi_icons["Traditional"] = load_icon( base + "cachetype-2.png" );
    okapi_icons["Multi"] = load_icon( base + "cachetype-3.png" );
    okapi_icons["Virtual"] = load_icon( base + "cachetype-4.png" );
    okapi_icons["Webcam"] = load_icon( base + "cachetype-5.png" );
    okapi_icons["Event"] = load_icon( base + "cachetype-6.png" );
    okapi_icons["Quiz"] = load_icon( base + "cachetype-7.png" );
    okapi_icons["Math/Physics"] = load_icon( base + "cachetype-8.png" );
    okapi_icons["Moving"] = load_icon( base + "cachetype-9.png" );
    okapi_icons["Drive-In"] = load_icon( base + "cachetype-10.png" );
}

function okapi_get_icon( type )
{
    okapi_create_icons();

    if( type in okapi_icons )
    {
        return okapi_icons[type];
    }
    else
    {
        return okapi_icons["Other"];
    }
}


function guess_okapi_siteid(code) {
    var site_name = null;
    
    if (/^OC/i.test(code)) { site_name = "Opencaching.DE"; } 
    else if (/^OP/i.test(code)) { site_name = "Opencaching.PL"; } 
    else if (/^OB/i.test(code)) { site_name = "Opencaching.NL"; } 
    else if (/^OU/i.test(code)) { site_name = "Opencaching.US"; }
    else if (/^OK/i.test(code)) { site_name = "Opencaching.ORG.UK"; }
    else if (/^OR/i.test(code)) { site_name = "Opencaching.RO"; }
    else { return -1; }
    
    for (var siteid in okapi_sites) {
        if (okapi_sites[siteid].name == site_name) {
            return siteid;
        }
    }
    
    return -1;
}


function okapi_center_map_on_cache(code) {
    console.log("okapi_center_map_on_cache " + code);
    if (!okapi_ready) {
        console.log("okapi not ready");
        return;
    }
    
    var siteid = guess_okapi_siteid(code);
    if (siteid < 0) {
        console.log("bad code. cannot determine okapi site");
        return;
    }
    
    _okapi_show_popup(null, code.toUpperCase(), siteid)
}


function _okapi_show_popup(m, code, siteid) {
    if (okapi_popup == null)
    {
        okapi_popup = new google.maps.InfoWindow();
    }

    var site = okapi_sites[siteid];

    $.ajax({
        url: site.url + 'services/caches/geocache',
        dataType: 'json',
        data: {
            'consumer_key': site.key,
            'cache_code': code,
            'fields' : 'name|type|status|url|owner|founds|size2|difficulty|terrain|location'
        },
        success: function(response) {
            var loc = response.location.split("|");
            var coords = new google.maps.LatLng(parseFloat(loc[0]), parseFloat(loc[1]));
            map.setCenter(coords);
            
            if (!m) {
                m = new google.maps.Marker( {
                    position: coords,
                    map: map,
                    icon: okapi_get_icon(response.type)
                });
                if (okapi_show_cache_marker) {
                    okapi_show_cache_marker.setMap(null);
                    delete(okapi_show_cache_marker);
                }
                
                okapi_register_popup(m, code, siteid);
                okapi_show_cache_marker = m;
            }
            
            var content =
                '<a href="' + response.url + '" target="_blank">' + code + ' <b>' + response.name + '</b></a><br />'
                + 'by <a href="' + response.owner.profile_url + '" target="_blank"><b>' + response.owner.username + '</b></a><br />'
                + response.type + ' (' + response.size2 + ')<br />'
                + 'status: <i>' + response.status + '</i><br />'
                + 'difficulty: <i>' + response.difficulty + '/5</i> terrain: <i>' + response.terrain + '/5</i><br />'
                + 'finds: <i>' + response.founds + '</i>';

            okapi_popup.setContent(content);
            okapi_popup.open(map, m);
        }
    });    
}


function okapi_register_popup(m, code, siteid)
{
    if (!okapi_ready) return;

    google.maps.event.addListener(m, 'click', function() {
        _okapi_show_popup(m, code, siteid);
    });
}

function okapi_remove_caches_site( okapi_markers )
{
    if( !okapi_ready ) return;

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

function okapi_remove_caches() {
    if (!okapi_ready) return;

    for (var siteid in okapi_sites) {
        okapi_remove_caches_site(okapi_sites[siteid].markers);
    }
    
    if (okapi_show_cache_marker) {
        okapi_show_cache_marker.setMap(null);
        delete(okapi_show_cache_marker);
        okapi_show_cache_marker = null;
    }
}


function okapi_load_caches_bbox_site( siteid )
{
    if( !okapi_ready ) return;

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
                okapi_register_popup( m, cache_code, siteid );
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
    if( !okapi_ready ) return;

    for( var siteid in okapi_sites )
    {
        okapi_load_caches_bbox_site( siteid );
    }
}

var okapi_load_timer = null;
function okapi_unschedule_load_caches()
{
    if( !okapi_ready ) return;

    if( okapi_load_timer != null )
    {
        window.clearTimeout( okapi_load_timer );
        okapi_load_timer = null;
    }
}

function okapi_schedule_load_caches()
{
    if( !okapi_ready ) return;

    okapi_unschedule_load_caches();
    okapi_load_timer = window.setTimeout( 'okapi_load_caches_bbox()', 500 );
}

function okapi_toggle_load_caches(t)
{
  Cookies.set('load_caches', t ? "1" : "0", {expires:30});

  if ($('#geocaches').is(':checked') != t)
  {
    $('#geocaches').attr('checked', t);
  }

  if (okapi_load_caches_enabled != t)
  {
    okapi_load_caches_enabled = t;
  }

  if (okapi_load_caches_enabled)
  {
    okapi_setup_sites();
    okapi_schedule_load_caches();
  }
  else
  {
    okapi_unschedule_load_caches();
    okapi_remove_caches();
  }
}

function restoreGeocaches(defaultValue)
{
  var state = get_cookie_string("load_caches", "invalid");

  if (state == "0")
  {
    okapi_toggle_load_caches(false);
  }
  else if (state == "1")
  {
    okapi_toggle_load_caches(true);
  }
  else
  {
    okapi_toggle_load_caches(defaultValue);
  }
}
