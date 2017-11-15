/*jslint
*/

/*global
  $, window, trackAction
*/


var ExternalLinks = {};
ExternalLinks.m_map = null;
ExternalLinks.m_targets = null;


ExternalLinks.init = function (themap) {

    'use strict';

    this.m_map = themap;

    if (this.m_targets) {
        return;
    }

    this.m_targets = {
        "★ Games ★": "",
        "Confluence.org": "http://www.confluence.org/confluence.php?lat=%lat%&lon=%lon%",
        "Geocaching.com": "http://coord.info/map?ll=%lat%,%lon%&z=%zoom%",
        "Geograph": "http://geo.hlipp.de/ommap.php?z=%zoom%&t=g&ll=%lat%,%lon%",
        "Ingress.com": "http://www.ingress.com/intel?latE6=%late6%&lngE6=%lone6%&z=%zoom%",
        "Lacita.org": "http://www.lacita.org/cgi_bin/bf.pl?Path=00&lat=%lat%&lng=%lon%&z=%zoom%",
        "Opencaching.de": "http://www.opencaching.de/map2.php?lat=%lat%&lon=%lon%&zoom=%zoom%",
        "Waymarking.com": "http://www.waymarking.com/wm/search.aspx?f=1&lat=%lat%&lon=%lon%",
        "★ Maps ★": "",
        "Bing Maps": "http://www.bing.com/maps/?v=2&cp=%lat%~%lon%&lvl=%zoom%",
        "Google Maps": "https://maps.google.com/maps?ll=%lat%,%lon%&z=%zoom%",
        "OpenStreetMap": "http://www.openstreetmap.org/?lat=%lat%&lon=%lon%&zoom=%zoom%",
        "OpenCycleMap": "http://www.opencyclemap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%",
        "ÖPNV-Karte": "http://www.öpnvkarte.de/?zoom=%zoom%&lat=%lat%&lon=%lon%",
        "Wheelmap.org": "http://wheelmap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%",
        "Wikimapia.org": "http://wikimapia.org/#lat=%lat%&lon=%lon%&z=%zoom%"
    };

    var tag = $('#externallinks');

    $.each(this.m_targets, function (key, value) {
        tag.append('<option value="' + key + '" data-url="' + value + '">' + key + '</option>');
    });
};


ExternalLinks.goto = function () {
    'use strict';

    var url = $('#externallinks').find(":selected").attr('data-url'),
        lat = this.m_map.getCenter().lat(),
        lng = this.m_map.getCenter().lng();

    if (!url || url === '') {
        return;
    }

    trackAction('external ' + url);

    url = url.replace(/%lat%/g, lat.toFixed(6));
    url = url.replace(/%lon%/g, lng.toFixed(6));
    url = url.replace(/%late6%/g, Math.round(lat * 1000000));
    url = url.replace(/%lone6%/g, Math.round(lng * 1000000));
    url = url.replace(/%zoom%/g, this.m_map.getZoom());

    window.open(url, '_blank');
};
