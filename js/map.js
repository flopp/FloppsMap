/*jslint
  indent: 4
*/

/*global
  $, google, Lang, Lines, Markers, Conversion, Cookies, Coordinates, trackMarker, showAlert,
  id2alpha, alpha2id,
  showProjectionDialog, showLinkDialog,
  osmProvider, osmDeProvider, thunderforestProvider, opentopomapProvider,
  get_cookie_int, get_cookie_float, get_cookie_string,
  Attribution, Sidebar, ExternalLinks, Hillshading, Geolocation, NPA, CDDA, Freifunk, Okapi,
  DownloadGPX, API_KEY_THUNDERFOREST,
  restoreCoordinatesFormat,
  document, window
*/


//var boundariesLayer = null;
//var boundariesLayerShown = false;
var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var ZOOM_DEFAULT_GEOCACHE = 15;
var MAPTYPE_DEFAULT = "OSM";


var App = {};
App.m_map = null;

App.urlParams = function () {
    'use strict';

    var params = {},
        splitted = window.location.search.substr(1).split('&'),
        i,
        p;

    for (i = 0; i < splitted.length; i += 1) {
        p = splitted[i].split('=', 2);
        if (p[0] !== "") {
            if (p.length === 1) {
                params[p[0]] = "";
            } else {
                params[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
        }
    }

    return params;
};


App.init = function () {
    'use strict';

    Lang.init();

    var params = App.urlParams();
    if (!App.initFromUrl(params)) {
        App.initFromCookies();
    }
};


App.initFromUrl = function (params) {
    'use strict';

    if (params.c === undefined &&
            params.z === undefined &&
            params.t === undefined &&
            params.m === undefined &&
            params.d === undefined &&
            params.f === undefined &&
            params.g === undefined) {
        return false;
    }

    var center = this.parseCenterFromUrl(params.c),
        zoom = this.repairZoom(parseInt(params.z, 10), (params.g === undefined) ? ZOOM_DEFAULT : ZOOM_DEFAULT_GEOCACHE),
        maptype = this.repairMaptype(params.t, MAPTYPE_DEFAULT),
        markerdata = this.parseMarkersFromUrl(params.m),
        defaultCenter = false;

    if (!center && markerdata.length > 0) {
        var clat = 0,
            clng = 0;
        markerdata.map(function (m) {
            clat += m.coords.lat();
            clng += m.coords.lng();
        });
        center = new google.maps.LatLng(clat / markerdata.length, clng / markerdata.length);
    }
    if (!center) {
        center = new google.maps.LatLng(CLAT_DEFAULT, CLON_DEFAULT);
        defaultCenter = true;
    }

    App.m_map = this.createMap("themap", center, zoom, maptype);

    markerdata.map(function (m) {
        Markers.newMarker(m.coords, m.id, m.r, m.name, m.color);
    });

    this.parseLinesFromUrl(params.d).map(function (m) {
        Lines.newLine(m.source, m.target);
    });

    App.restore(params.f, params.g);

    if (defaultCenter && params.g !== undefined) {
        Geolocation.whereAmI();
    }

    return true;
};


App.initFromCookies = function () {
    'use strict';

    var clat = this.repairLat(get_cookie_float('clat', CLAT_DEFAULT)),
        clon = this.repairLon(get_cookie_float('clon', CLON_DEFAULT)),
        defaultCenter = (clat === CLAT_DEFAULT && clon === CLON_DEFAULT),
        center = new google.maps.LatLng(clat, clon),
        zoom = this.repairZoom(get_cookie_int('zoom', ZOOM_DEFAULT), ZOOM_DEFAULT),
        maptype = this.repairMaptype(get_cookie_string('maptype', MAPTYPE_DEFAULT), MAPTYPE_DEFAULT);


    App.m_map = this.createMap("themap", center, zoom, maptype);

    this.parseMarkersFromCookies().map(function (m) {
        Markers.newMarker(m.coords, m.id, m.r, m.name, m.color);
    });

    this.parseLinesFromCookies().map(function (m) {
        Lines.newLine(m.source, m.target);
    });

    App.restore(undefined);

    if (defaultCenter) {
        Geolocation.whereAmI();
    }
};


App.restore = function (features, geocache) {
    'use strict';

    if (geocache !== undefined) {
        Okapi.setShowCache(geocache);
    }

    Sidebar.restore(true);

    if (features === undefined) {
        Hillshading.restore(false);
        //restoreBoundaries(false);
        Okapi.restore(false);
        NPA.toggle(false);
        CDDA.toggle(false);
        Freifunk.toggle(false);
    } else {
        features = features.toLowerCase();
        Hillshading.toggle(features.indexOf('h') >= 0);
        //toggleBoundaries(xfeatures.indexOf('b') >= 0);
        Okapi.toggle(features.indexOf('g') >= 0);
        NPA.toggle(features.indexOf('n') >= 0);
        Freifunk.toggle(features.indexOf('f') >= 0);
    }

    restoreCoordinatesFormat("DM");

    if (geocache !== undefined) {
        Okapi.toggle(true);
    }
};


App.storeCenter = function () {
    'use strict';

    var c = App.m_map.getCenter();
    Cookies.set('clat', c.lat(), {expires: 30});
    Cookies.set('clon', c.lng(), {expires: 30});
};


App.storeZoom = function () {
    'use strict';

    Cookies.set('zoom', App.m_map.getZoom(), {expires: 30});
};


App.storeMapType = function () {
    'use strict';

    Cookies.set('maptype', App.m_map.getMapTypeId(), {expires: 30});
};


App.getFeaturesString = function () {
    'use strict';

    var s = "";
    //if ($('#boundaries').is(':checked')) { s += "b"; }
    if ($('#geocaches').is(':checked')) {
        s += "g";
    }
    if ($('#hillshading').is(':checked')) {
        s += "h";
    }
    if ($('#npa').is(':checked')) {
        s += "n";
    }
    if ($('#freifunk').is(':checked')) {
        s += "f";
    }

    return s;
};


App.getPermalink = function () {
    'use strict';

    var lat = App.m_map.getCenter().lat(),
        lng = App.m_map.getCenter().lng(),
        geocache = Okapi.popupCacheCode(),
        url = "https://flopp.net/" +
                "?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) +
                "&z=" + App.m_map.getZoom() +
                "&t=" + App.m_map.getMapTypeId() +
                "&f=" + this.getFeaturesString() +
                "&m=" + Markers.toString() +
                "&d=" + Lines.getLinesText();
    if (geocache) {
        url += "&g=" + geocache;
    }
    return url;
};

App.generatePermalink = function () {
    'use strict';

    var link = this.getPermalink();
    showLinkDialog(link);
};


App.repairLat = function (x, d) {
    'use strict';

    if (Coordinates.validLat(x)) {
        return x;
    }

    return d;
};


App.repairLon = function (x, d) {
    'use strict';

    if (Coordinates.validLng(x)) {
        return x;
    }

    return d;
};


App.repairRadius = function (x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 0 || x > 100000000) {
        return d;
    }

    return x;
};


App.repairZoom = function (x, d) {
    'use strict';

    if (x === undefined || x === null || isNaN(x) || x < 1 || x > 20) {
        return d;
    }

    return x;
};


App.repairMaptype = function (t, d) {
    'use strict';

    var mapTypes = {
        "OSM": 1,
        "OSM/DE": 1,
        "OCM": 1,
        "OUTD": 1,
        "TOPO": 1,
        "satellite": 1,
        "hybrid": 1,
        "roadmap": 1,
        "terrain": 1
    };

    if (t !== undefined && mapTypes[t]) {
        return t;
    }

    return d;
};


App.parseMarkersFromUrl = function (urlarg) {
    'use strict';

    if (!urlarg) {
        return [];
    }

    var data;

    // ID:COODRS:R(:NAME)?|ID:COORDS:R(:NAME)?
    // COORDS=LAT:LON or DEG or DMMM
    if (urlarg.indexOf("*") >= 0) {
        data = urlarg.split('*');
    } else {
        /* sep is '|' */
        data = urlarg.split('|');
    }

    return data.map(function (dataitem) {
        dataitem = dataitem.split(':');
        if (dataitem.length < 3 || dataitem.length > 6) {
            return null;
        }

        var m = {
                alpha: dataitem[0],
                id: alpha2id(dataitem[0]),
                name: null,
                coords: null,
                r: 0,
                color: ""
            },
            index = 1,
            lat,
            lon;

        if (m.id < 0) {
            return null;
        }

        lat = parseFloat(dataitem[index]);
        lon = parseFloat(dataitem[index + 1]);
        if (Coordinates.valid(lat, lon)) {
            index += 2;
            m.coords = new google.maps.LatLng(lat, lon);
        } else {
            m.coords = Coordinates.fromString(dataitem[index]);
            index += 1;
        }
        if (!m.coords) {
            return null;
        }

        m.r = App.repairRadius(parseFloat(dataitem[index]), 0);
        index = index + 1;

        if (index < dataitem.length &&
                (/^([a-zA-Z0-9\-_]*)$/).test(dataitem[index])) {
            m.name = dataitem[index];
        }

        index = index + 1;
        if (index < dataitem.length &&
                (/^([a-fA-F0-9]{6})$/).test(dataitem[index])) {
            m.color = dataitem[index];
        }

        return m;
    }).filter(function (thing) {
        return thing !== null;
    });
};


App.parseCenterFromUrl = function (urlarg) {
    'use strict';

    if (!urlarg) {
        return null;
    }

    var data = urlarg.split(':');

    if (data.length === 1) {
        return Coordinates.fromString(data[0]);
    }

    if (data.length === 2) {
        return Coordinates.toLatLng(parseFloat(data[0]), parseFloat(data[1]));
    }

    return null;
};


App.parseLinesFromUrl = function (urlarg) {
    'use strict';

    if (urlarg === undefined || urlarg === null) {
        return [];
    }

    /* be backwards compatible */
    if (urlarg.length === 3
            && alpha2id(urlarg[0]) >= 0
            && urlarg[1] === '*'
            && alpha2id(urlarg[1]) >= 0) {
        urlarg = urlarg[0] + ':' + urlarg[2];
    }

    return urlarg.split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            return {source: alpha2id(pair[0]), target: alpha2id(pair[1])};
        }
        return null;
    }).filter(function (thing) {
        return (thing !== null);
    });
};


App.parseMarkersFromCookies = function () {
    'use strict';

    var raw_ids = Cookies.get('markers');

    if (!raw_ids) {
        return [];
    }

    return raw_ids.split(':').map(function (id_string) {
        var m = {id: null, name: null, coords: null, r: 0, color: ""},
            raw_data,
            data;

        m.id = parseInt(id_string, 10);
        if (m.id === null || m.id < 0 || m.id >= 26 * 10) {
            return null;
        }

        raw_data = Cookies.get('marker' + m.id);
        if (!raw_data) {
            return null;
        }

        data = raw_data.split(':');
        if (data.length !== 4 && data.length !== 5) {
            return null;
        }

        m.coords = Coordinates.toLatLng(parseFloat(data[0]), parseFloat(data[1]));
        if (!m.coords) {
            return null;
        }

        m.r = App.repairRadius(parseFloat(data[2]), 0);

        if ((/^([a-zA-Z0-9\-_]*)$/).test(data[3])) {
            m.name = data[3];
        }

        if (data.length === 5 && (/^([a-fA-F0-9]{6})$/).test(data[4])) {
            m.color = data[4];
        }

        return m;
    }).filter(function (thing) {
        return (thing !== null);
    });
};


App.parseLinesFromCookies = function () {
    'use strict';

    var raw_lines = Cookies.get('lines');

    if (!raw_lines) {
        return [];
    }

    return raw_lines.split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            return {source: alpha2id(pair[0]), target: alpha2id(pair[1])};
        }
        return null;
    }).filter(function (thing) {
        return (thing !== null);
    });
};


App.createMap = function (id, center, zoom, maptype) {
    'use strict';

    var m = new google.maps.Map(
        document.getElementById(id),
        {
            zoom: zoom,
            center: center,
            scaleControl: true,
            streetViewControl: false,
            mapTypeControlOptions: {mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'OUTD', 'TOPO', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN]},
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    );

    m.mapTypes.set("OSM", osmProvider("OSM"));
    m.mapTypes.set("OSM/DE", osmDeProvider("OSM/DE"));
    m.mapTypes.set("OCM", thunderforestProvider("OCM", "cycle", API_KEY_THUNDERFOREST));
    m.mapTypes.set("OUTD", thunderforestProvider("OUTD", "outdoors", API_KEY_THUNDERFOREST));
    m.mapTypes.set("TOPO", opentopomapProvider("TOPO"));
    m.setMapTypeId(maptype);

    Attribution.init(m);
    Sidebar.init(m);
    ExternalLinks.init(m);
    Markers.init(m);
    Lines.init(m);
    Geolocation.init(m);
    Hillshading.init(m);
    NPA.init(m);
    CDDA.init(m);
    Freifunk.init(m);
    Okapi.init(m);
    DownloadGPX.init(m);

    //boundariesLayer = new google.maps.ImageMapType({
    //  getTileUrl: function(coord, zoom) {
    //    if (6 <= zoom && zoom <= 16)
    //    {
    //      return tileUrl("http://korona.geog.uni-heidelberg.de/tiles/adminb/?x=%x&y=%y&z=%z", ["dummy"], coord, zoom);
    //    }
    //    else
    //    {
    //      return null;
    //    }
    //  },
    //  tileSize: new google.maps.Size(256, 256),
    //  name: "adminb",
    //  alt: "Administrative Boundaries",
    //  maxZoom: 16 });

    m.setCenter(center, zoom);

    google.maps.event.addListener(m, "center_changed", function () {
        App.storeZoom();
        App.storeCenter();
    });
    google.maps.event.addListener(m, "zoom_changed", function () {
        App.storeZoom();
        App.storeCenter();
    });
    google.maps.event.addListener(m, "maptypeid_changed", function () {
        App.storeMapType();
    });

    Attribution.forceUpdate();

    return m;
};
