/*jslint
  indent: 4
*/

/*global
  $, google, showAlert, mytrans
*/

var CDDA = {};
CDDA.m_map = null;
CDDA.m_layer = null;
CDDA.m_layerShown = false;
CDDA.m_infoMode = false;
CDDA.m_clickListener = null;


CDDA.init = function (map) {
    'use strict';

    this.m_map = map;
};


CDDA.getLayer = function () {
    'use strict';

    if (!this.m_layer) {
        var tileSize = 256,
            themap = this.m_map;
        this.m_layer = new google.maps.ImageMapType({
            getTileUrl: function (coord, zoom) {
                var proj = themap.getProjection(),
                    zfactor = tileSize / Math.pow(2, zoom),
                    top = proj.fromPointToLatLng(new google.maps.Point(coord.x * zfactor, coord.y * zfactor)),
                    bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * zfactor, (coord.y + 1) * zfactor)),
                    bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat(),
                    url;
                url = "https://bio.discomap.eea.europa.eu/arcgis/rest/services/ProtectedSites/CDDA_Dyna_WM/MapServer/export?" +
                    "dpi=96" +
                    "&transparent=true" +
                    "&format=png32" +
                    "&layers=show%3A0%2C1%2C2%2C3%2C4" +
                    "&BBOX=" + bbox +
                    "&bboxSR=4326" +
                    "&size=" + tileSize + "%2C" + tileSize +
                    "&f=image";
                return url;
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
        url = "https://bio.discomap.eea.europa.eu/arcgis/rest/services/ProtectedSites/CDDA_Dyna_WM/MapServer/identify" +
            "?geometry=" + coords.lng() + "%2C" + coords.lat() +
            "&geometryType=esriGeometryPoint" +
            "&sr=4326" +
            "&layers=all" +
            "&returnGeometry=false" +
            "&tolerance=1" +
            "&mapExtent=1" +
            "&imageDisplay=1" +
            "&f=json";

    $.ajax({url: url, timeout: 3000})
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

    $('#dialogCDDA').modal({show : true, backdrop: "static", keyboard: true});
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
