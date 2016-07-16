/*jslint
  indent: 4
*/

/*global
  Coordinates, $, google, mytrans
*/

var Freifunk = {};
Freifunk.m_map = null;
Freifunk.m_infoMode = false;
Freifunk.m_clickListener = null;


Freifunk.init = function (map) {
    'use strict';

    this.m_map = map;
};


Freifunk.toggle = function (t) {
    'use strict';

    if ($('#freifunk').is(':checked') !== t) {
        $('#freifunk').attr('checked', t);
    }

    if (t) {
        $('#freifunk_details').show();
    } else {
        $('#freifunk_details').hide();
        this.endInfoMode();
    }
};


Freifunk.startInfoMode = function () {
    'use strict';

    var self = this;

    if (this.m_infoMode) {
        return;
    }
    this.m_infoMode = true;

    this.m_map.setOptions({draggableCursor: 'crosshair'});
    this.m_clickListener = google.maps.event.addListener(this.m_map, 'click', function (event) {
        self.showPopup(event.latLng.lat(), event.latLng.lng());
        self.endInfoMode();
    });
};


Freifunk.endInfoMode = function () {
    'use strict';

    if (!this.m_infoMode) {
        return;
    }
    this.m_infoMode = false;

    this.m_map.setOptions({draggableCursor: ''});
    google.maps.event.removeListener(this.m_clickListener);
};


Freifunk.showPopup = function (lat, lng) {
    'use strict';

    var contentString =
        "<div>" + mytrans("dialog.freifunk.popuptitle") + "</div>" +
        "<textarea readonly rows=5 cols=70>" +
        "uci set gluon-node-info.@location[0]='location'\n" +
        "uci set gluon-node-info.@location[0].share_location='1'\n" +
        "uci set gluon-node-info.@location[0].latitude='" + lat + "'\n" +
        "uci set gluon-node-info.@location[0].longitude='" + lng + "'\n" +
        "uci commit" +
        "</textarea>",
        infowindow = new google.maps.InfoWindow({
            content: contentString,
            position: new google.maps.LatLng(lat, lng)
        });
    infowindow.open(this.m_map);
};


Freifunk.showDialog = function () {
    'use strict';

    $('#dialogFreifunk').modal({show : true, backdrop: "static", keyboard: true});
};
