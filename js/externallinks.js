/*jslint
  indent: 4
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

    this.m_targets = [];
    this.m_targets["★ Games ★"] = "";
    this.m_targets["Confluence.org"] = "http://www.confluence.org/confluence.php?lat=%lat%&lon=%lon%";
    this.m_targets["Geocaching.com"] = "http://coord.info/map?ll=%lat%,%lon%&z=%zoom%";
    this.m_targets["Geograph"] = "http://geo.hlipp.de/ommap.php?z=%zoom%&t=g&ll=%lat%,%lon%";
    this.m_targets["Ingress.com"] = "http://www.ingress.com/intel?latE6=%late6%&lngE6=%lone6%&z=%zoom%";
    this.m_targets["Lacita.org"] = "http://www.lacita.org/cgi_bin/bf.pl?Path=00&lat=%lat%&lng=%lon%&z=%zoom%";
    this.m_targets["Opencaching.de"] = "http://www.opencaching.de/map2.php?lat=%lat%&lon=%lon%&zoom=%zoom%";
    this.m_targets["Waymarking.com"] = "http://www.waymarking.com/wm/search.aspx?f=1&lat=%lat%&lon=%lon%";
    this.m_targets["★ Maps ★"] = "";
    this.m_targets["Bing Maps"] = "http://www.bing.com/maps/?v=2&cp=%lat%~%lon%&lvl=%zoom%";
    this.m_targets["Google Maps"] = "https://maps.google.com/maps?ll=%lat%,%lon%&z=%zoom%";
    this.m_targets["OpenStreetMap"] = "http://www.openstreetmap.org/?lat=%lat%&lon=%lon%&zoom=%zoom%";
    this.m_targets["OpenCycleMap"] = "http://www.opencyclemap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%";
    this.m_targets["ÖPNV-Karte"] = "http://www.öpnvkarte.de/?zoom=%zoom%&lat=%lat%&lon=%lon%";
    this.m_targets["Wheelmap.org"] = "http://wheelmap.org/?zoom=%zoom%&lat=%lat%&lon=%lon%";
    this.m_targets["Wikimapia.org"] = "http://wikimapia.org/#lat=%lat%&lon=%lon%&z=%zoom%";

    var key,
        tag = $('#externallinks');

    for (key in this.m_targets) {
        tag.append('<option value="' + key + '">' + key + '</option>');
    }
};


ExternalLinks.goto = function () {
    'use strict';

    var selected = $('#externallinks').find(":selected").text(),
        url = this.m_targets[selected],
        lat = this.m_map.getCenter().lat(),
        lng = this.m_map.getCenter().lng();

    if (!url || url === '') {
        return;
    }

    trackAction('external ' + selected);

    url = url.replace(/%lat%/g, lat.toFixed(6));
    url = url.replace(/%lon%/g, lng.toFixed(6));
    url = url.replace(/%late6%/g, Math.round(lat * 1000000));
    url = url.replace(/%lone6%/g, Math.round(lng * 1000000));
    url = url.replace(/%zoom%/g, this.m_map.getZoom());

    window.open(url, '_blank');
};
