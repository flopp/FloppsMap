/*jslint
  indent: 4
*/

/*global
  $, google, Lines, Markers, Conversion, Cookies, Coordinates, trackMarker, mytrans, showAlert,
  id2alpha, alpha2id,
  showProjectionDialog, showLinkDialog,
  osmProvider, osmDeProvider, ocmProvider, thunderforestOutdoorsProvider, opentopomapProvider,
  get_cookie_int, get_cookie_float, get_cookie_string,
  Attribution, Sidebar, ExternalLinks, Hillshading, Geolocation, NPA, CDDA, Freifunk, Okapi,
  restoreCoordinatesFormat,
  document
*/

//var boundariesLayer = null;
//var boundariesLayerShown = false;
var map = null;
var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var MAPTYPE_DEFAULT = "OSM";


function projectFromMarker(id) {
    'use strict';

    trackMarker('project');

    var mm = Markers.getById(id),
        oldpos = mm.getPosition();

    showProjectionDialog(
        function (data1, data2) {
            var angle = Conversion.getFloat(data1, 0, 360),
                dist = Conversion.getFloat(data2, 0, 100000000000),
                newpos,
                newmarker;

            if (angle === null) {
                showAlert(
                    mytrans("dialog.error"),
                    mytrans("dialog.projection.error_bad_bearing").replace(/%1/, data1)
                );
                return;
            }

            if (dist === null) {
                showAlert(
                    mytrans("dialog.error"),
                    mytrans("dialog.projection.error_bad_distance").replace(/%1/, data2)
                );
                return;
            }

            newpos = Coordinates.projection_geodesic(oldpos, angle, dist);
            newmarker = Markers.newMarker(newpos, -1, 0, null);
            if (newmarker) {
                showAlert(
                    mytrans("dialog.information"),
                    mytrans("dialog.projection.msg_new_marker").replace(/%1/, newmarker.getAlpha())
                );
            }
        }
    );
}


function storeCenter() {
    'use strict';

    var c = map.getCenter();
    Cookies.set('clat', c.lat(), {expires: 30});
    Cookies.set('clon', c.lng(), {expires: 30});
}


function storeZoom() {
    'use strict';

    Cookies.set('zoom', map.getZoom(), {expires: 30});
}


function storeMapType() {
    'use strict';

    Cookies.set('maptype', map.getMapTypeId(), {expires: 30});
}


function getFeaturesString() {
    'use strict';

    var s = "";
    //if ($('#boundaries').is(':checked')) { s += "b"; }
    if ($('#geocaches').is(':checked')) { s += "g"; }
    if ($('#hillshading').is(':checked')) { s += "h"; }
    if ($('#npa').is(':checked')) { s += "n"; }
    if ($('#freifunk').is(':checked')) { s += "f"; }

    return s;
}


function getPermalink() {
    'use strict';

    var lat = map.getCenter().lat(),
        lng = map.getCenter().lng();

    return "http://flopp.net/" +
        "?c=" + lat.toFixed(6) + ":" + lng.toFixed(6) +
        "&z=" + map.getZoom() +
        "&t=" + map.getMapTypeId() +
        "&f=" + getFeaturesString() +
        "&m=" + Markers.toString() +
        "&d=" + Lines.getLinesText();
}

function generatePermalink() {
    'use strict';

    var link = getPermalink();
    showLinkDialog(link);
}


function repairLat(x, d) {
    'use strict';

    if (Coordinates.validLat(x)) {
        return x;
    }

    return d;
}


function repairLon(x, d) {
    'use strict';

    if (Coordinates.validLng(x)) {
        return x;
    }

    return d;
}


function repairRadius(x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 0 || x > 100000000) {
        return d;
    }

    return x;
}


function repairZoom(x, d) {
    'use strict';

    if (x === null || isNaN(x) || x < 1 || x > 20) {
        return d;
    }

    return x;
}


function repairMaptype(t, d) {
    'use strict';

    var mapTypes = {
        "OSM": 1, "OSM/DE": 1, "OCM": 1, "OUTD": 1, "TOPO": 1, "satellite": 1, "hybrid": 1, "roadmap": 1, "terrain": 1
    };

    if (mapTypes[t]) {
        return t;
    }

    return d;
}


function parseMarkersFromUrl(urlarg) {
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
        if (dataitem.length < 3 || dataitem.length > 5) {
            return;
        }

        var m = {
                alpha: dataitem[0],
                id: alpha2id(dataitem[0]),
                name: null,
                coords: null,
                r: 0
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

        m.r = repairRadius(parseFloat(dataitem[index]), 0);
        index = index + 1;

        if (index < dataitem.length &&
                /^([a-zA-Z0-9-_]*)$/.test(dataitem[index])) {
            m.name = dataitem[index];
        }

        markers.push(m);
    });

    return markers;
}


function parseCenterFromUrl(urlarg) {
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
}


function parseLinesFromUrl(urlarg) {
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
}


function parseMarkersFromCookies() {
    'use strict';

    var raw_ids = Cookies.get('markers'),
        markers = [];

    if (raw_ids === null || raw_ids === undefined) {
        return markers;
    }

    raw_ids.split(':').map(function (id_string) {
        var m = {id: null, name: null, coords: null, r: 0},
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
        if (data.length !== 4) {
            return;
        }

        m.coords = Coordinates.toLatLng(parseFloat(data[0]), parseFloat(data[1]));
        if (!m.coords) {
            return;
        }

        m.r = repairRadius(parseFloat(data[2]), 0);

        if (/^([a-zA-Z0-9-_]*)$/.test(data[3])) {
            m.name = data[3];
        }

        markers.push(m);
    });

    return markers;
}


function parseLinesFromCookies() {
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
}


function initialize(xcenter, xzoom, xmap, xfeatures, xmarkers, xlines, xgeocache) {
    'use strict';

    var center,
        //atDefaultCenter = false,
        zoom = parseInt(xzoom, 10),
        maptype = xmap,
        loadfromcookies = false,
        markerdata = parseMarkersFromUrl(xmarkers),
        markercenter = null,
        clat = 0,
        clon = 0;
    if (markerdata.length > 0) {
        markerdata.map(function (m) {
            clat += m.coords.lat();
            clon += m.coords.lng();
        });
        markercenter = new google.maps.LatLng(clat / markerdata.length, clon / markerdata.length);
    }

    if (xcenter && xcenter !== '') {
        center = parseCenterFromUrl(xcenter);
    } else if (markercenter) {
        center = markercenter;
    } else {
        loadfromcookies = true;

        /* try to read coordinats from cookie */
        clat = get_cookie_float('clat', CLAT_DEFAULT);
        clon = get_cookie_float('clon', CLON_DEFAULT);
        //if (clat === CLAT_DEFAULT && clon === CLON_DEFAULT) {
        //    atDefaultCenter = true;
        //}

        clat = repairLat(clat, CLAT_DEFAULT);
        clon = repairLon(clon, CLON_DEFAULT);
        center = new google.maps.LatLng(clat, clon);

        zoom = get_cookie_int('zoom', ZOOM_DEFAULT);
        maptype = get_cookie_string('maptype', MAPTYPE_DEFAULT);
    }

    if (!center) {
        center = new google.maps.LatLng(CLAT_DEFAULT, CLON_DEFAULT);
        //atDefaultCenter = true;
    }

    zoom = repairZoom(zoom, ZOOM_DEFAULT);
    maptype = repairMaptype(maptype, MAPTYPE_DEFAULT);
    map = new google.maps.Map(
        document.getElementById("themap"),
        {
            zoom: zoom,
            center: center,
            scaleControl: true,
            streetViewControl: false,
            mapTypeControlOptions: { mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'OUTD', 'TOPO', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN] },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    );

    map.mapTypes.set("OSM", osmProvider("OSM"));
    map.mapTypes.set("OSM/DE", osmDeProvider("OSM/DE"));
    map.mapTypes.set("OCM", ocmProvider("OCM"));
    map.mapTypes.set("OUTD", thunderforestOutdoorsProvider("OUTD"));
    map.mapTypes.set("TOPO", opentopomapProvider("TOPO"));
    map.setMapTypeId(maptype);

    Attribution.init(map);
    Sidebar.init(map);
    ExternalLinks.init(map);
    Markers.init(map);
    Lines.init(map);
    Geolocation.init(map);
    Hillshading.init(map);
    NPA.init(map);
    CDDA.init(map);
    Freifunk.init(map);
    Okapi.init(map);

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

    map.setCenter(center, zoom);

    google.maps.event.addListener(map, "center_changed", function () {
        storeZoom();
        storeCenter();
    });
    google.maps.event.addListener(map, "zoom_changed", function () {
        storeZoom();
        storeCenter();
    });
    google.maps.event.addListener(map, "maptypeid_changed", function () {
        storeMapType();
    });

    if (loadfromcookies) {
        parseMarkersFromCookies().map(function (m) {
            Markers.newMarker(m.coords, m.id, m.r, m.name);
        });

        parseLinesFromCookies().map(function (m) {
            Lines.newLine(m.source, m.target);
        });
    } else {
        markerdata.map(function (m) {
            Markers.newMarker(m.coords, m.id, m.r, m.name);
        });

        parseLinesFromUrl(xlines).map(function (m) {
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
        //atDefaultCenter = false;
    }

    Attribution.forceUpdate();

    //if (atDefaultCenter) {
    //  Geolocation.whereAmI();
    //}
}
