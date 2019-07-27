/*jslint
  indent: 4
*/

/*global
  $, google, showAlert, Lang, tileUrl, Persist
*/

var Hillshading = {};
Hillshading.m_map = null;
Hillshading.m_layer = null;
Hillshading.m_layerShown = false;


Hillshading.init = function (map) {
    'use strict';

    this.m_map = map;
};


Hillshading.getLayer = function () {
    'use strict';

    if (!this.m_layer) {
        var tileSize = 256,
            url = 'https://tiles.wmflabs.org/hillshading/%z/%x/%y.png';

        this.m_layer = new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                if (6 <= zoom && zoom <= 15) {
                    return tileUrl(url, ['dummy'], coord, zoom);
                }
                return null;
            },
            tileSize: new google.maps.Size(tileSize, tileSize),
            name: "hill",
            alt: "Hillshading",
            maxZoom: 15
        });
    }
    return this.m_layer;
};


Hillshading.toggle = function (t) {
    'use strict';

    Persist.setValue('hillshading', t ? "1" : "0");

    if ($('#hillshading').is(':checked') !== t) {
        $('#hillshading').attr('checked', t);
    }

    if (this.m_layerShown === t) {
        return;
    }

    this.m_layerShown = t;

    if (t) {
        this.m_map.overlayMapTypes.insertAt(0, this.getLayer());
    } else if (this.m_layer) {
        this.m_map.overlayMapTypes.removeAt(this.m_map.overlayMapTypes.indexOf(this.m_layer));
    }
};


Hillshading.restore = function (defaultValue) {
    'use strict';

    var state = Persist.getValue("hillshading", "invalid");
    if (state === "0") {
        this.toggle(false);
    } else if (state === "1") {
        this.toggle(true);
    } else {
        this.toggle(defaultValue);
    }
};
