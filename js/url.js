/*jslint
  indent: 4
*/
/*global
  google, window,
  App, Coordinates,
  alpha2id
*/

var Url = {};

Url.getParams = function () {
    'use strict';

    var params = {},
        splitted = window.location.search.substr(1).split('&'),
        i,
        p;

    for (i = 0; i < splitted.length; i += 1) {
        p = splitted[i].split('=', 2);
        if (p[0] !== "") {
            if (p.length === 1) {
                params[p[0]] = "";
            } else {
                params[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
            }
        }
    }

    return params;
};

Url.parseMarkers = function (urlarg) {
    'use strict';

    if (!urlarg) {
        return [];
    }

    var data;

    // ID:COODRS:R(:NAME)?|ID:COORDS:R(:NAME)?
    // COORDS=LAT:LON or DEG or DMMM
    if (urlarg.indexOf("*") >= 0) {
        data = urlarg.split('*');
    } else {
        /* sep is '|' */
        data = urlarg.split('|');
    }

    return data.map(function (dataitem) {
        dataitem = dataitem.split(':');
        if (dataitem.length < 3 || dataitem.length > 6) {
            return null;
        }

        var m = {
                alpha: dataitem[0],
                id: alpha2id(dataitem[0]),
                name: null,
                coords: null,
                r: 0,
                color: ""
            },
            index = 1,
            lat,
            lon;

        if (m.id < 0) {
            return null;
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
            return null;
        }

        m.r = App.repairRadius(parseFloat(dataitem[index]), 0);
        index = index + 1;

        if (index < dataitem.length &&
                (/^([a-zA-Z0-9\-_]*)$/).test(dataitem[index])) {
            m.name = dataitem[index];
        }

        index = index + 1;
        if (index < dataitem.length &&
                (/^([a-fA-F0-9]{6})$/).test(dataitem[index])) {
            m.color = dataitem[index];
        }

        return m;
    }).filter(function (thing) {
        return thing !== null;
    });
};


Url.parseCenter = function (urlarg) {
    'use strict';

    if (!urlarg) {
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
};


Url.parseLines = function (urlarg) {
    'use strict';

    if (!urlarg) {
        return [];
    }

    /* be backwards compatible */
    if (urlarg.length === 3
            && alpha2id(urlarg[0]) >= 0
            && urlarg[1] === '*'
            && alpha2id(urlarg[1]) >= 0) {
        urlarg = urlarg[0] + ':' + urlarg[2];
    }

    return urlarg.split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            return {source: alpha2id(pair[0]), target: alpha2id(pair[1])};
        }
        return null;
    }).filter(function (thing) {
        return (thing !== null);
    });
};
