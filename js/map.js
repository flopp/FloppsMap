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
  document
*/


//var boundariesLayer = null;
//var boundariesLayerShown = false;
var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var MAPTYPE_DEFAULT = "OSM";


var Map = {};
Map.m_map = null;

Map.init = function (xcenter, xzoom, xmap, xfeatures, xmarkers, xlines, xgeocache) {
    'use strict';

    var center,
        atDefaultCenter = false,
        zoom = parseInt(xzoom, 10),
        maptype = xmap,
        loadfromcookies = false,
        markerdata = this.parseMarkersFromUrl(xmarkers),
        markercenter = null,
        clat = 0,
        clon = 0;

    Lang.init();

    if (markerdata.length > 0) {
        markerdata.map(function (m) {
            clat += m.coords.lat();
            clon += m.coords.lng();
        });
        markercenter = new google.maps.LatLng(clat / markerdata.length, clon / markerdata.length);
    }

    if (xcenter && xcenter !== '') {
        center = this.parseCenterFromUrl(xcenter);
    } else if (markercenter) {
        center = markercenter;
    } else {
        loadfromcookies = true;

        /* try to read coordinats from cookie */
        clat = get_cookie_float('clat', CLAT_DEFAULT);
        clon = get_cookie_float('clon', CLON_DEFAULT);
        if (clat === CLAT_DEFAULT && clon === CLON_DEFAULT) {
            atDefaultCenter = true;
        }

        clat = this.repairLat(clat, CLAT_DEFAULT);
        clon = this.repairLon(clon, CLON_DEFAULT);
        center = new google.maps.LatLng(clat, clon);

        zoom = get_cookie_int('zoom', ZOOM_DEFAULT);
        maptype = get_cookie_string('maptype', MAPTYPE_DEFAULT);
    }

    if (!center) {
        center = new google.maps.LatLng(CLAT_DEFAULT, CLON_DEFAULT);
        atDefaultCenter = true;
    }

    zoom = this.repairZoom(zoom, ZOOM_DEFAULT);
    maptype = this.repairMaptype(maptype, MAPTYPE_DEFAULT);
    Map.m_map = this.createMap("themap", center, zoom, maptype);

    if (loadfromcookies) {
        this.parseMarkersFromCookies().map(function (m) {
            Markers.newMarker(m.coords, m.id, m.r, m.name, m.color);
        });

        this.parseLinesFromCookies().map(function (m) {
            Lines.newLine(m.source, m.target);
        });
    } else {
        markerdata.map(function (m) {
            Markers.newMarker(m.coords, m.id, m.r, m.name, m.color);
        });

        this.parseLinesFromUrl(xlines).map(function (m) {
            Lines.newLine(m.source, m.target);
        });
    }

    Okapi.setShowCache(xgeocache);
    Sidebar.restore(true);
    xfeatures = xfeatures.toLowerCase();
    if (xfeatures === '[default]') {
        Hillshading.restore(false);
        //restoreBoundaries(false);
        Okapi.restore(false);
        NPA.toggle(false);
        CDDA.toggle(false);
        Freifunk.toggle(false);
    } else {
        Hillshading.toggle(xfeatures.indexOf('h') >= 0);
        //toggleBoundaries(xfeatures.indexOf('b') >= 0);
        Okapi.toggle(xfeatures.indexOf('g') >= 0);
        NPA.toggle(xfeatures.indexOf('n') >= 0);
        Freifunk.toggle(xfeatures.indexOf('f') >= 0);
    }
    restoreCoordinatesFormat("DM");

    if (xgeocache !== "") {
        Okapi.toggle(true);
        atDefaultCenter = false;
    }

    Attribution.forceUpdate();

    if (atDefaultCenter) {
        Geolocation.whereAmI();
    }
};

Map.storeCenter = function () {
    'use strict';

    var c = Map.m_map.getCenter();
    Cookies.set('clat', c.lat(), {expires: 30});
    Cookies.set('clon', c.lng(), {expires: 30});
};


Map.storeZoom = function () {
    'use strict';

    Cookies.set('zoom', Map.m_map.getZoom(), {expires: 30});
};


Map.storeMapType = function () {
    'use strict';

    Cookies.set('maptype', Map.m_map.getMapTypeId(), {expires: 30});
};


Map.getFeaturesString = function () {
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


Map.getPermalink = function () {
    'use strict';

    var lat = Map.m_map.getCenter().lat(),
        lng = Map.m_map.getCenter().lng(),
        geocache = Okapi.popupCacheCode(),
        url = "https://flopp.net/" +
                "?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) +
                "&z=" + Map.m_map.getZoom() +
                "&t=" + Map.m_map.getMapTypeId() +
                "&f=" + this.getFeaturesString() +
                "&m=" + Markers.toString() +
                "&d=" + Lines.getLinesText();
    if (geocache) {
        url += "&g=" + geocache;
    }
    return url;
};

Map.generatePermalink = function () {
    'use strict';

    var link = this.getPermalink();
    showLinkDialog(link);
};


Map.repairLat = function (x, d) {
    'use strict';

    if (Coordinates.validLat(x)) {
        return x;
    }

    return d;
};


Map.repairLon = function (x, d) {
    'use strict';

    if (Coordinates.validLng(x)) {
        return x;
    }

    return d;
};


Map.repairRadius = function (x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 0 || x > 100000000) {
        return d;
    }

    return x;
};


Map.repairZoom = function (x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 1 || x > 20) {
        return d;
    }

    return x;
};


Map.repairMaptype = function (t, d) {
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

    if (mapTypes[t]) {
        return t;
    }

    return d;
};


Map.parseMarkersFromUrl = function (urlarg) {
    'use strict';

    if (urlarg === null) {
        return [];
    }

    var markers = [],
        data;

    // ID:COODRS:R(:NAME)?|ID:COORDS:R(:NAME)?
    // COORDS=LAT:LON or DEG or DMMM
    if (urlarg.indexOf("*") >= 0) {
        data = urlarg.split('*');
    } else {
        /* sep is '|' */
        data = urlarg.split('|');
    }

    data.map(function (dataitem) {
        dataitem = dataitem.split(':');
        if (dataitem.length < 3 || dataitem.length > 6) {
            return;
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
            return;
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
            return;
        }

        m.r = this.repairRadius(parseFloat(dataitem[index]), 0);
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

        markers.push(m);
    });

    return markers;
};


Map.parseCenterFromUrl = function (urlarg) {
    'use strict';

    if (urlarg === null) {
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


Map.parseLinesFromUrl = function (urlarg) {
    'use strict';

    if (urlarg === null) {
        return [];
    }

    var lines = [];

    /* be backwards compatible */
    if (urlarg.length === 3
            && alpha2id(urlarg[0]) >= 0
            && urlarg[1] === '*'
            && alpha2id(urlarg[1]) >= 0) {
        urlarg = urlarg[0] + ':' + urlarg[2];
    }

    urlarg.split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            lines.push({source: alpha2id(pair[0]), target: alpha2id(pair[1])});
        }

    });

    return lines;
};


Map.parseMarkersFromCookies = function () {
    'use strict';

    var raw_ids = Cookies.get('markers'),
        markers = [];

    if (raw_ids === null || raw_ids === undefined) {
        return markers;
    }

    raw_ids.split(':').map(function (id_string) {
        var m = {id: null, name: null, coords: null, r: 0, color: ""},
            raw_data,
            data;

        m.id = parseInt(id_string, 10);
        if (m.id === null || m.id < 0 || m.id >= 26 * 10) {
            return;
        }

        raw_data = Cookies.get('marker' + m.id);
        if (!raw_data) {
            return;
        }

        data = raw_data.split(':');
        if (data.length !== 4 && data.length !== 5) {
            return;
        }

        m.coords = Coordinates.toLatLng(parseFloat(data[0]), parseFloat(data[1]));
        if (!m.coords) {
            return;
        }

        m.r = Map.repairRadius(parseFloat(data[2]), 0);

        if ((/^([a-zA-Z0-9\-_]*)$/).test(data[3])) {
            m.name = data[3];
        }

        if (data.length === 5 && (/^([a-fA-F0-9]{6})$/).test(data[4])) {
            m.color = data[4];
        }

        markers.push(m);
    });

    return markers;
};


Map.parseLinesFromCookies = function () {
    'use strict';

    var raw_lines = Cookies.get('lines'),
        lines = [];

    if (!raw_lines) {
        return lines;
    }

    raw_lines.split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            lines.push({source: alpha2id(pair[0]), target: alpha2id(pair[1])});
        }
    });

    return lines;
};


Map.createMap = function (id, center, zoom, maptype) {
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
        Map.storeZoom();
        Map.storeCenter();
    });
    google.maps.event.addListener(m, "zoom_changed", function () {
        Map.storeZoom();
        Map.storeCenter();
    });
    google.maps.event.addListener(m, "maptypeid_changed", function () {
        Map.storeMapType();
    });

    return m;
};
