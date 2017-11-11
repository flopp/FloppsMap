/*jslint
  indent: 4
*/

/*global
  $, google, Lang, window, Cookies, Coordinates, get_cookie_string
*/


var Okapi = {};
Okapi.m_map = null;
Okapi.m_sites = null;
Okapi.m_ready = false;
Okapi.m_showCache = null;
Okapi.m_enabled = false;
Okapi.m_popup = null;
Okapi.m_popupCacheCode = null;
Okapi.m_marker = null;
Okapi.m_icons = null;
Okapi.m_timer = null;


Okapi.init = function (themap) {
    'use strict';

    this.m_map = themap;
    var self = this;

    google.maps.event.addListener(this.m_map, "center_changed", function () {
        self.scheduleLoad();
    });
    google.maps.event.addListener(this.m_map, "zoom_changed", function () {
        self.scheduleLoad();
    });
};


Okapi.parseLocation = function (s) {
    'use strict';

    var loc = s.split("|"),
        lat = parseFloat(loc[0]),
        lng = parseFloat(loc[1]);

    if (Coordinates.valid(lat, lng)) {
        return new google.maps.LatLng(lat, lng);
    }

    return null;
};


Okapi.setShowCache = function (code) {
    'use strict';

    this.m_showCache = code;
};


Okapi.setupSites = function () {
    'use strict';

    if (this.m_sites) {
        return;
    }

    var self = this,
        main_url = "proxy2.php?url=http://www.opencaching.de/okapi/services/apisrv/installations",
        keys = {
            "Opencaching.DE" : "YSqPufH82encfJ67ZxV2",
            "Opencaching.PL" : "jhRyc6rGmT6XEvxva29B",
            "Opencaching.NL" : "gcwaesuq3REu8RtCgLDj",
            "Opencaching.US" : "GvgyCMvwfH42GqJGL494",
            "Opencache.UK" : "7t7VfpkCd4HuxPabfbHd",
            "Opencaching.RO" : "gqSWmVJhZGDwc4sRhyy7"
        },
        prefixes = {
            "Opencaching.DE" : "OC",
            "Opencaching.PL" : "OP",
            "Opencaching.NL" : "OB",
            "Opencaching.US" : "OU",
            "Opencache.UK" : "OK",
            "Opencaching.RO" : "OR"
        };

    this.m_sites = [];

    $.ajax({
        url: main_url,
        dataType: 'json',
        success: function (response) {
            response.map(function (site) {
                if (keys[site.site_name] !== undefined) {
                    self.m_sites.push({
                        siteid: self.m_sites.length,
                        name: site.site_name,
                        site_url: site.site_url,
                        url: site.okapi_base_url,
                        proxy: site.okapi_base_url.startsWith('http:'),
                        prefix: prefixes[site.site_name],
                        key: keys[site.site_name],
                        ignore_user: null,
                        markers: {},
                        finished: true
                    });
                }
            });

            self.m_ready = true;
            if (self.m_enabled) {
                self.scheduleLoad(true);
            }
            if (self.m_showCache && self.m_showCache !== "") {
                self.centerMap(self.m_showCache);
                self.m_showCache = null;
            }
        }
    });
};


Okapi.setupIcons = function () {
    'use strict';

    if (this.m_icons) {
        return;
    }

    this.m_icons = {
        "Other": new google.maps.MarkerImage("img/cachetype-1.png"),
        "Traditional": new google.maps.MarkerImage("img/cachetype-2.png"),
        "Multi": new google.maps.MarkerImage("img/cachetype-3.png"),
        "Virtual": new google.maps.MarkerImage("img/cachetype-4.png"),
        "Webcam": new google.maps.MarkerImage("img/cachetype-5.png"),
        "Event": new google.maps.MarkerImage("img/cachetype-6.png"),
        "Quiz": new google.maps.MarkerImage("img/cachetype-7.png"),
        "Math/Physics": new google.maps.MarkerImage("img/cachetype-8.png"),
        "Moving": new google.maps.MarkerImage("img/cachetype-9.png"),
        "Drive-In": new google.maps.MarkerImage("img/cachetype-10.png")
    };
};


Okapi.icon = function (type) {
    'use strict';

    if (this.m_icons[type] !== undefined) {
        return this.m_icons[type];
    }

    return this.m_icons.Other;
};


Okapi.guessSiteId = function (code) {
    'use strict';

    code = code.toUpperCase();
    var siteid;
    for (siteid = 0; siteid < this.m_sites.length; siteid += 1) {
        if (code.startsWith(this.m_sites[siteid].prefix)) {
            return siteid;
        }
    }

    return -1;
};


Okapi.centerMap = function (code) {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    var siteid = this.guessSiteId(code);
    if (siteid < 0) {
        return;
    }

    this.showPopup(null, code.toUpperCase(), siteid);
};


Okapi.popupCacheCode = function () {
    'use strict';

    if (!this.m_popup) {
        return null;
    }

    var m = this.m_popup.getMap();
    if (!m || typeof m === "undefined") {
        return null;
    }

    return this.m_popupCacheCode;
};


Okapi.createPopupContent = function (code, response) {
    'use strict';

    var content =
        '<a href="' + response.url + '" target="_blank">' + code + ' <b>' + response.name + '</b></a><br />'
        + '<table class="cache-popup">'
        + '<tr><td>' + Lang.t("geocache.owner") + '</td><td>' + '<a href="' + response.owner.profile_url + '" target="_blank"><b>' + response.owner.username + '</b></a></td></tr>'
        + '<tr><td>' + Lang.t("geocache.type") + '</td><td>' + response.type + '</td></tr>'
        + '<tr><td>' + Lang.t("geocache.size") + '</td><td>' + response.size2 + '</td></tr>'
        + '<tr><td>' + Lang.t("geocache.status") + '</td><td>' + response.status + '</td></tr>'
        + '<tr><td>' + Lang.t("geocache.difficulty") + '</td><td>' + response.difficulty + '/5</td></tr>'
        + '<tr><td>' + Lang.t("geocache.terrain") + '</td><td>' + response.terrain + '/5</td></tr>'
        + '<tr><td>' + Lang.t("geocache.finds") + '</td><td>' + response.founds + '</td></tr>'
        + '</table>';
    return content;
};


Okapi.showPopup = function (m, code, siteid) {
    'use strict';

    this.m_popupCacheCode = code;

    if (!this.m_popup) {
        this.m_popup = new google.maps.InfoWindow();
    }

    var self = this,
        site = this.m_sites[siteid],
        url,
        data;

    url = site.url + 'services/caches/geocache';
    data = {
        consumer_key: site.key,
        cache_code: code,
        fields: 'name|type|status|url|owner|founds|size2|difficulty|terrain|location'
    };

    if (site.proxy) {
        data = {
            url: url + "?" + $.param(data)
        };
        url = "proxy2.php";
    }

    $.ajax({
        url: url,
        dataType: 'json',
        data: data,
        success: function (response) {
            var coords = self.parseLocation(response.location);
            self.m_map.setCenter(coords);

            if (!m) {
                m = new google.maps.Marker({
                    position: coords,
                    map: self.m_map,
                    icon: self.icon(response.type)
                });
                if (self.m_maker) {
                    self.m_marker.setMap(null);
                }
                self.registerPopup(m, code, siteid);
                self.m_marker = m;
            }

            self.m_popup.setContent(self.createPopupContent(code, response));
            self.m_popup.open(self.m_map, m);
        }
    });
};


Okapi.registerPopup = function (m, code, siteid) {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    var self = this;

    google.maps.event.addListener(m, 'click', function () {
        self.showPopup(m, code, siteid);
    });
};


Okapi.removeMarkers = function () {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    this.m_sites.map(function (site) {
        var key;
        for (key in site.markers) {
            if (site.markers.hasOwnProperty(key)) {
                site.markers[key].setMap(null);
            }
        }
        site.markers = {};
    });

    if (this.m_marker) {
        this.m_marker.setMap(null);
        delete this.m_marker;
        this.m_marker = null;
    }
};


Okapi.loadBboxSite = function (siteid) {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    var self = this,
        site = this.m_sites[siteid],
        b,
        bbox,
        url,
        data;

    if (!this.m_enabled) {
        site.finished = true;
        return;
    }

    if (!site.finished) {
        return;
    }

    site.finished = false;

    b = this.m_map.getBounds();
    bbox = b.getSouthWest().lat() + "|" + b.getSouthWest().lng() + "|" + b.getNorthEast().lat() + "|" + b.getNorthEast().lng();

    url = site.url + 'services/caches/shortcuts/search_and_retrieve';
    data = {
        consumer_key: site.key,
        search_method: 'services/caches/search/bbox',
        search_params: '{"bbox" : "' + bbox + '", "limit" : "500"}',
        retr_method: 'services/caches/geocaches',
        retr_params: '{"fields": "code|name|location|type|status|url"}',
        wrap: 'false'
    };

    if (site.proxy) {
        data = {
            url: url + "?" + $.param(data)
        };
        url = "proxy2.php";
    }

    $.ajax({
        url: url,
        dataType: 'json',
        data: data,
        success: function (response) {
            var addedCaches = {},
                cache,
                code;

            for (code in response) {
                if (!response.hasOwnProperty(code)) {
                    continue;
                }

                cache = response[code];
                if (cache.status !== "Available") {
                    continue;
                }

                addedCaches[cache.code] = true;
                if (site.markers[cache.code] !== undefined) {
                    continue;
                }

                site.markers[cache.code] = new google.maps.Marker({
                    position: self.parseLocation(cache.location),
                    map: self.m_map,
                    icon: self.icon(cache.type)
                });

                self.registerPopup(site.markers[cache.code], cache.code, siteid);
            }

            for (code in site.markers) {
                if (site.markers.hasOwnProperty(code) && addedCaches[code] === undefined) {
                    site.markers[code].setMap(null);
                    delete site.markers[code];
                }
            }
            site.finished = true;
        },
        error: function () {
            site.markers = {};
            site.finished = true;
        }
    });
};


Okapi.loadBbox = function () {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    var self = this;
    this.m_sites.map(function (site) {
        self.loadBboxSite(site.siteid);
    });
};


Okapi.unscheduleLoad = function () {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    if (this.m_timer) {
        window.clearTimeout(this.m_timer);
        this.m_timer = null;
    }
};


Okapi.scheduleLoad = function () {
    'use strict';

    if (!this.m_ready) {
        return;
    }

    var self = this;

    this.unscheduleLoad();
    this.m_timer = window.setTimeout(function () {
        self.loadBbox();
    }, 500);
};


Okapi.toggle = function (t) {
    'use strict';

    Cookies.set('load_caches', t ? "1" : "0", {expires: 30});
    if ($('#geocaches').is(':checked') !== t) {
        $('#geocaches').attr('checked', t);
    }

    if (this.m_enabled !== t) {
        this.m_enabled = t;
    }

    if (this.m_enabled) {
        this.setupIcons();
        this.setupSites();
        this.scheduleLoad();
    } else {
        this.unscheduleLoad();
        this.removeMarkers();
    }
};


Okapi.restore = function (defaultValue) {
    'use strict';

    var state = get_cookie_string("load_caches", "invalid");

    if (state === "0") {
        this.toggle(false);
    } else if (state === "1") {
        this.toggle(true);
    } else {
        this.toggle(defaultValue);
    }
};
