/*jslint
  indent: 4
*/

/*global
  $, google, showAlert, Lang
*/

var NPA = {};
NPA.m_map = null;
NPA.m_url = null;
NPA.m_layer = null;
NPA.m_layerShown = false;
NPA.m_infoMode = false;
NPA.m_clickListener = null;


NPA.init = function (map) {
    'use strict';

    this.m_url = "https://geodienste.bfn.de/ogc/wms/schutzgebiet";
    this.m_map = map;
};


NPA.getLayer = function () {
    'use strict';

    if (!this.m_layer) {
        var tileSize = 256,
            themap = this.m_map,
            self = this;
        this.m_layer = new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                var proj = themap.getProjection(),
                    zfactor = tileSize / Math.pow(2, zoom),
                    top = proj.fromPointToLatLng(new google.maps.Point(coord.x * zfactor, coord.y * zfactor)),
                    bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * zfactor, (coord.y + 1) * zfactor)),
                    bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat();
                return self.m_url + "?" +
                        "REQUEST=GetMap" +
                        "&SERVICE=WMS" +
                        "&VERSION=1.3.0" +
                        "&LAYERS=Naturschutzgebiete" +
                        "&FORMAT=image/png" +
                        "&BGCOLOR=0xFFFFFF" +
                        "&STYLES=default" +
                        "&TRANSPARENT=TRUE" +
                        "&CRS=CRS:84" +
                        "&BBOX=" + bbox +
                        "&WIDTH=" + tileSize +
                        "&HEIGHT=" + tileSize;
            },
            tileSize: new google.maps.Size(tileSize, tileSize),
            isPng: true,
            opacity: 0.6
        });
    }
    return this.m_layer;
};


NPA.getPopupContentFromResponse = function (json) {
    'use strict';

    if (json && json.features && json.features.length > 0) {
        return '<b>' + json.features[0].properties.NAME + '</b><br/>' +
                Lang.t("dialog.npa.cdda_code") + ' ' + json.features[0].properties.CDDA_CODE + '<br />' +
                Lang.t("dialog.npa.since") + ' ' + json.features[0].properties.JAHR + '<br />' +
                Lang.t("dialog.npa.area") + ' ' + json.features[0].properties.FLAECHE + ' ha<br />';
    }

    return null;
};


NPA.getInfo = function (coords) {
    'use strict';

    var self = this,
        data = {
            REQUEST: "GetFeatureInfo",
            SERVICE: "WMS",
            VERSION: "1.3.0",
            CRS: "CRS:84",
            BBOX: coords.lng() + ',' + coords.lat() + ',' + (coords.lng() + 0.001) + ',' + (coords.lat() + 0.001),
            WIDTH: 256,
            HEIGHT: 256,
            INFO_FORMAT: "application/geojson",
            FEATURE_COUNT: 1,
            QUERY_LAYERS: "Naturschutzgebiete",
            X: 0,
            Y: 0
        };
    $.ajax({
        url: "proxy2.php",
        dataType: "json",
        data: {
            url: self.m_url + "?" + $.param(data)
        },
        timeout: 3000
    }).done(function (data) {
        var content = self.getPopupContentFromResponse(data),
            infowindow;
        if (content) {
            infowindow = new google.maps.InfoWindow({
                content: content,
                position: coords
            });
            infowindow.open(self.m_map);
        } else {
            showAlert(
                Lang.t("dialog.information"),
                Lang.t("dialog.npa.msg_no_npa")
            );
        }
    }).fail(function () {
        showAlert(
            Lang.t("dialog.error"),
            Lang.t("dialog.npa.error")
        );
    });
};


NPA.toggle = function (t) {
    'use strict';

    if ($('#npa').is(':checked') !== t) {
        $('#npa').attr('checked', t);
    }

    if (t) {
        $('#npa_details').show();
    } else {
        $('#npa_details').hide();
        this.endInfoMode();
    }

    if (this.m_layerShown === t) {
        return;
    }
    this.m_layerShown = t;

    if (t) {
        this.m_map.overlayMapTypes.push(this.getLayer());
    } else if (this.m_layer) {
        this.m_map.overlayMapTypes.removeAt(this.m_map.overlayMapTypes.indexOf(this.m_layer));
    }
};


NPA.showDialog = function () {
    'use strict';

    $('#dialogNPA').modal({show: true, backdrop: "static", keyboard: true});
};


NPA.startInfoMode = function () {
    'use strict';

    if (this.m_infoMode) {
        return;
    }

    var self = this;
    this.m_map.setOptions({draggableCursor: 'help'});
    this.m_infoMode = true;
    this.m_clickListener = google.maps.event.addListener(this.m_map, 'click', function (event) {
        self.getInfo(event.latLng);
        self.endInfoMode();
    });
};


NPA.endInfoMode = function () {
    'use strict';

    if (!this.m_infoMode) {
        return;
    }

    this.m_map.setOptions({draggableCursor: ''});
    this.m_infoMode = false;
    google.maps.event.removeListener(this.m_clickListener);
};
