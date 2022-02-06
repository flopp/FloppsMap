/*jslint
*/

/*global
  $, google, Url, Lang, Lines, Markers, Conversion, Coordinates, trackMarker, showAlert,
  id2alpha, alpha2id,
  showLinkDialog,
  osmProvider, osmDeProvider, opentopomapProvider,
  Attribution, Sidebar, ExternalLinks,
  Hillshading,
  Geolocation, NPA, CDDA, Freifunk, Okapi, Persist,
  ContextMenu,
  DownloadGPX,
  restoreCoordinatesFormat,
  document, window
*/


var CLAT_DEFAULT = 51.163375;
var CLON_DEFAULT = 10.447683;
var ZOOM_DEFAULT = 12;
var ZOOM_DEFAULT_GEOCACHE = 15;
var MAPTYPE_DEFAULT = "OSM";


var App = {};
App.m_map = null;


App.init = function () {
    'use strict';

    Persist.init();
    Lang.init();

    if (!App.initFromUrl(Url.getParams())) {
        App.initFromPersist();
    }

    if (window.location.hostname !== "flopp.net") {
        showDeprecatedUrlDialog(window.location.hostname);
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

    var center = Url.parseCenter(params.c),
        zoom = this.repairZoom(parseInt(params.z, 10), (params.g === undefined)
            ? ZOOM_DEFAULT
            : ZOOM_DEFAULT_GEOCACHE),
        maptype = this.repairMaptype(params.t, MAPTYPE_DEFAULT),
        markerdata = Url.parseMarkers(params.m),
        defaultCenter = false,
        clat = 0,
        clng = 0;

    if (!center && markerdata.length > 0) {
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

    Url.parseLines(params.d).map(function (m) {
        Lines.newLine(m.source, m.target);
    });

    App.restore(params.f, params.g);

    if (defaultCenter && params.g !== undefined) {
        Geolocation.whereAmI(false);
    }

    return true;
};


App.initFromPersist = function () {
    'use strict';

    var clat = this.repairLat(Persist.getFloat('clat', CLAT_DEFAULT)),
        clon = this.repairLon(Persist.getFloat('clon', CLON_DEFAULT)),
        defaultCenter = (clat === CLAT_DEFAULT && clon === CLON_DEFAULT),
        center = new google.maps.LatLng(clat, clon),
        zoom = this.repairZoom(Persist.getInt('zoom', ZOOM_DEFAULT), ZOOM_DEFAULT),
        maptype = this.repairMaptype(Persist.getValue('maptype', MAPTYPE_DEFAULT), MAPTYPE_DEFAULT);


    App.m_map = this.createMap("themap", center, zoom, maptype);

    Persist.parseMarkers().map(function (m) {
        Markers.newMarker(m.coords, m.id, m.r, m.name, m.color);
    });

    Persist.parseLines().map(function (m) {
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
        // Hillshading.restore(false);
        Okapi.restore(false);
        NPA.toggle(false);
        CDDA.toggle(false);
        Freifunk.toggle(false);
    } else {
        features = features.toLowerCase();
        // Hillshading.toggle(features.indexOf('h') >= 0);
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
    Persist.setValue('clat', c.lat());
    Persist.setValue('clon', c.lng());
};


App.storeZoom = function () {
    'use strict';

    Persist.setValue('zoom', App.m_map.getZoom());
};


App.storeMapType = function () {
    'use strict';

    Persist.setValue('maptype', App.m_map.getMapTypeId());
};


App.getFeaturesString = function () {
    'use strict';

    var s = "";
    if ($('#geocaches').is(':checked')) {
        s += "g";
    }
    // if ($('#hillshading').is(':checked')) {
        // s += "h";
    // }
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
        OSM: 1,
        "OSM/DE": 1,
        OCM: 1,
        OUTD: 1,
        TOPO: 1,
        satellite: 1,
        hybrid: 1,
        roadmap: 1,
        terrain: 1
    };

    if (t !== undefined && mapTypes[t]) {
        return t;
    }

    return d;
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
            mapTypeControlOptions: {
                mapTypeIds: ['OSM', 'OSM/DE', 'OCM', 'OUTD', 'TOPO', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.TERRAIN]
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
    );

    m.mapTypes.set("OSM", osmProvider("OSM"));
    m.mapTypes.set("OSM/DE", osmDeProvider("OSM/DE"));
    m.mapTypes.set("TOPO", opentopomapProvider("TOPO"));
    m.setMapTypeId(maptype);

    Attribution.init(m);
    Sidebar.init(m);
    ExternalLinks.init(m);
    Markers.init(m);
    Lines.init(m);
    Geolocation.init(m);
    // Hillshading.init(m);
    NPA.init(m);
    CDDA.init(m);
    Freifunk.init(m);
    Okapi.init(m);
    DownloadGPX.init(m);
    ContextMenu.init(m, $('#map-context-menu'));

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


$(document).ready(function () {
    'use strict';
    App.init();
});
