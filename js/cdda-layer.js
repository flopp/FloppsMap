/*jslint
  indent: 4
*/

/*global
  $, google, showAlert, mytrans
*/

var CDDA = {};
CDDA.m_map = null;
CDDA.m_url = null;
CDDA.m_layer = null;
CDDA.m_layerShown = false;
CDDA.m_infoMode = false;
CDDA.m_clickListener = null;


CDDA.init = function (map) {
    'use strict';

    this.m_map = map;
    this.m_url = 'https://bio.discomap.eea.europa.eu/arcgis/rest/services/ProtectedSites/CDDA_Dyna_WM/MapServer';
};


CDDA.getLayer = function () {
    'use strict';

    if (!this.m_layer) {
        var tileSize = 256,
            self = this;
        this.m_layer = new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                var proj = self.m_map.getProjection(),
                    zfactor = tileSize / Math.pow(2, zoom),
                    top = proj.fromPointToLatLng(new google.maps.Point(coord.x * zfactor, coord.y * zfactor)),
                    bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * zfactor, (coord.y + 1) * zfactor)),
                    data;
                data = {
                    dpi: 96,
                    transparent: true,
                    format: "png32",
                    layers: "0,1,2,3,4",
                    BBOX: top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat(),
                    bboxSR: 4326,
                    size: tileSize + "," + tileSize,
                    f: "image"
                };
                return self.m_url + "/export?" + $.param(data);
            },
            tileSize: new google.maps.Size(tileSize, tileSize),
            isPng: true,
            opacity: 0.6
        });
    }
    return this.m_layer;
};


CDDA.getPopupContentFromResponse = function (json) {
    'use strict';

    var i,
        attr,
        type = "",
        year = "";

    if (json && json.results) {
        for (i = 0; i < json.results.length; i = i + 1) {
            attr = json.results[i].attributes;

            if (attr && attr.SITE_NAME && attr.SITE_NAME !== "") {
                if (attr.YEAR) {
                    year = attr.YEAR;
                }
                if (attr.DESIGNATE) {
                    type = attr.DESIGNATE;
                }
                if (attr.ODESIGNATE) {
                    if (type !== "") {
                        type += " (" + attr.ODESIGNATE + ")";
                    } else {
                        type = attr.ODESIGNATE;
                    }
                }

                return '<b>' + attr.SITE_NAME + '</b><br/>' + type + '<br />' + year;
            }
        }
    }

    return null;
};


CDDA.getInfo = function (coords) {
    'use strict';

    var self = this,
        data = {
            geometry: coords.lng() + "," + coords.lat(),
            geometryType: "esriGeometryPoint",
            sr: 4326,
            layers: "all",
            returnGeometry: false,
            tolerance: 1,
            mapExtent: 1,
            imageDisplay: 1,
            f: "json"
        };
    $.ajax({url: self.m_url + "/identify?" + $.param(data), timeout: 3000})
        .done(function (data) {
            var json = $.parseJSON(data),
                content = self.getPopupContentFromResponse(json),
                infowindow;

            if (content) {
                infowindow = new google.maps.InfoWindow({
                    content: content,
                    position: coords
                });
                infowindow.open(self.m_map);
            } else {
                showAlert(
                    mytrans("dialog.information"),
                    mytrans("dialog.cdda.msg_no_data")
                );
            }
        })
        .fail(function () {
            showAlert(
                mytrans("dialog.information"),
                mytrans("dialog.cdda.msg_failed")
            );
        });
};


CDDA.toggle = function (t) {
    'use strict';

    if ($('#cdda').is(':checked') !== t) {
        $('#cdda').attr('checked', t);
    }

    if (t) {
        $('#cdda_details').show();
    } else {
        $('#cdda_details').hide();
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


CDDA.showDialog = function () {
    'use strict';

    $('#dialogCDDA').modal({show: true, backdrop: "static", keyboard: true});
};


CDDA.startInfoMode = function () {
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


CDDA.endInfoMode = function () {
    'use strict';

    if (!this.m_infoMode) {
        return;
    }

    this.m_map.setOptions({draggableCursor: ''});
    this.m_infoMode = false;
    google.maps.event.removeListener(this.m_clickListener);
};
