/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, google, document, setTimeout
*/

var Attribution = {};
Attribution.m_map = null;
Attribution.m_div = null;

Attribution.init = function (themap) {
    'use strict';

    var self = this;

    this.m_map = themap;

    // Create div for showing copyrights.
    this.m_div = document.createElement("div");
    this.m_div.id = "map-copyright";
    this.m_div.style.fontSize = "11px";
    this.m_div.style.fontFamily = "Arial, sans-serif";
    this.m_div.style.margin = "0 2px 2px 0";
    this.m_div.style.whiteSpace = "nowrap";
    this.m_div.style.background = "#FFFFFF";
    this.m_map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(this.m_div);

    google.maps.event.addListener(this.m_map, "maptypeid_changed", function () {
        self.update();
    });
};


Attribution.update = function () {
    'use strict';

    var m = this.m_map.getMapTypeId(),
        g = true,
        c = "";

    if (m === "OSM" || m === "OSM/DE") {
        g = false;
        c = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>";
    } else if (m === "OCM") {
        g = false;
        c = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://opencyclemap.org\">OpenCycleMap.org</a>";
    } else if (m === "OUTD") {
        g = false;
        c = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, tiles (C) by <a href=\"http://www.thunderforest.com/outdoors/\">Thunderforest</a>";
    } else if (m === "TOPO") {
        g = false;
        c = "Map data (C) by <a href=\"http://www.openstreetmap.org/\">OpenStreetMap.org</a> and its contributors; <a href=\"http://opendatacommons.org/licenses/odbl/\">Open Database License</a>, height data by SRTM, tiles (C) by <a href=\"http://www.opentopomap.org/\">OpenTopoMap</a>";
    }

    this.m_div.innerHTML = c;

    if (g) {
        $(".gmnoprint a, .gmnoprint span, .gm-style-cc").css("display", "block");
        $("a[href*='maps.google.com/maps']").show();
        this.m_map.setOptions({streetViewControl: true});
    } else {
        // hide logo for non-g-maps
        $("a[href*='maps.google.com/maps']").hide();
        // hide term-of-use for non-g-maps
        $(".gmnoprint a, .gmnoprint span, .gm-style-cc").css("display", "none");
        this.m_map.setOptions({streetViewControl: false});
    }
};


Attribution.forceUpdate = function () {
    'use strict';

    var self = this;

    this.update();
    google.maps.event.addListenerOnce(this.m_map, 'idle', function () {
        self.update();
    });
    setTimeout(function () {
        self.update();
    }, 1000);
};
