/*jslint
  regexp: true
  indent: 4
*/

/*global
  GeographicLib, google
*/

var Coordinates = {};
Coordinates.m_format = "DM";
Coordinates.m_geod = GeographicLib.Geodesic.WGS84;


Coordinates.setFormat = function (format) {
    'use strict';

    if (format === "DM" || format === "DMS" || format === "D") {
        this.m_format = format;
    }
};


Coordinates.validLat = function (lat) {
    'use strict';

    return lat !== null && lat !== undefined && !isNaN(lat) &&
        -90.0 <= lat && lat <= 90.0;
};


Coordinates.validLng = function (lng) {
    'use strict';

    return lng !== null && lng !== undefined && !isNaN(lng) &&
        -180.0 <= lng && lng <= 180.0;
};


Coordinates.valid = function (lat, lng) {
    'use strict';

    return this.validLat(lat) && this.validLng(lng);
};


Coordinates.fromString = function (coordsString) {
    'use strict';

    coordsString = coordsString.trim();

    var matches, pattern,
        lat, lat_sign, lat_d, lat_m, lat_s,
        lng, lng_sign, lng_d, lng_m, lng_s;

    // H DDD MM.MMM
    pattern = /^[^A-Za-z0-9.\-]*([ns])[^A-Za-z0-9.\-]*(\d+)[^A-Za-z0-9.\-]+([\d\.]+)[^A-Za-z0-9.\-]+([we])[^A-Za-z0-9.\-]*(\d+)[^A-Za-z0-9.\-]+([\d\.]+)[^A-Za-z0-9.\-]*$/i;
    matches = coordsString.match(pattern);
    if (matches) {
        lat_sign = (matches[1] === 's' || matches[1] === 'S') ? -1 : 1;
        lng_sign = (matches[4] === 'w' || matches[4] === 'W') ? -1 : 1;

        lat_d = parseFloat(matches[2]);
        lat_m = parseFloat(matches[3]);

        lng_d = parseFloat(matches[5]);
        lng_m = parseFloat(matches[6]);

        lat = lat_sign * (lat_d + (lat_m / 60.0));
        lng = lng_sign * (lng_d + (lng_m / 60.0));

        return new google.maps.LatLng(lat, lng);
    }

    // H DDD MM SS.SSS
    pattern = /^[^A-Za-z0-9.\-]*([ns])[^A-Za-z0-9.\-]*(\d+)[^A-Za-z0-9.\-]+(\d+)[^A-Za-z0-9.\-]+([\d\.]+)[^A-Za-z0-9.\-]+([we])[^A-Za-z0-9.\-]*(\d+)[^A-Za-z0-9.\-]+(\d+)[^A-Za-z0-9.\-]+([\d\.]+)[^A-Za-z0-9.\-]*$/i;
    matches = coordsString.match(pattern);
    if (matches) {
        lat_sign = (matches[1] === 's' || matches[1] === 'S') ? -1 : 1;
        lng_sign = (matches[5] === 'w' || matches[5] === 'W') ? -1 : 1;

        lat_d = parseFloat(matches[2]);
        lat_m = parseFloat(matches[3]);
        lat_s = parseFloat(matches[4]);

        lng_d = parseFloat(matches[6]);
        lng_m = parseFloat(matches[7]);
        lng_s = parseFloat(matches[8]);

        lat = lat_sign * (lat_d + (lat_m / 60.0) + (lat_s / 3600.0));
        lng = lng_sign * (lng_d + (lng_m / 60.0) + (lng_s / 3600.0));

        return new google.maps.LatLng(lat, lng);
    }

    // H DDD.DDDDD
    pattern = /^[^A-Za-z0-9.\-]*([ns])[^A-Za-z0-9.\-]*([\d\.]+)[^A-Za-z0-9.\-]+([we])[^A-Za-z0-9.\-]*([\d\.]+)[^A-Za-z0-9.\-]*$/i;
    matches = coordsString.match(pattern);
    if (matches) {
        lat_sign = (matches[1] === 's' || matches[1] === 'S') ? -1 : 1;
        lng_sign = (matches[3] === 'w' || matches[3] === 'W') ? -1 : 1;

        lat = lat_sign * parseFloat(matches[2]);
        lng = lng_sign * parseFloat(matches[4]);

        return new google.maps.LatLng(lat, lng);
    }

    // H DDD.DDDDD
    pattern = /^[^A-Za-z0-9.\-]*(-?)([\d\.]+)[^A-Za-z0-9.\-]+(-?)([\d\.]+)[^A-Za-z0-9.\-]*$/i;
    matches = coordsString.match(pattern);
    if (matches) {
        lat_sign = (matches[1] === '-') ? -1 : 1;
        lng_sign = (matches[3] === '-') ? -1 : 1;

        lat = lat_sign * parseFloat(matches[2]);
        lng = lng_sign * parseFloat(matches[4]);

        return new google.maps.LatLng(lat, lng);
    }

    return null;
};


Coordinates.toStringDM = function (coords) {
    'use strict';

    var lat = coords.lat(),
        lat_h = "N",
        lat_deg,
        lat_min,
        lat_mmin,
        lat_rest,
        lng = coords.lng(),
        lng_h = "E",
        lng_deg,
        lng_min,
        lng_mmin,
        lng_rest,
        s;

    if (lat < 0) {
        lat_h = "S";
        lat = -lat;
    }
    lat_deg = Math.floor(lat);
    lat_rest = lat - lat_deg;
    lat_min = Math.floor(lat_rest * 60);
    lat_rest = lat_rest * 60 - lat_min;
    lat_mmin = Math.floor(Math.round(lat_rest * 1000));
    while (lat_mmin >= 1000) {
        lat_mmin -= 1000;
        lat_min += 1;
    }

    if (lng < 0) {
        lng_h = "W";
        lng = -lng;
    }
    lng_deg = Math.floor(lng);
    lng_rest = lng - lng_deg;
    lng_min = Math.floor(lng_rest * 60);
    lng_rest = lng_rest * 60 - lng_min;
    lng_mmin = Math.floor(Math.round(lng_rest * 1000));
    while (lng_mmin >= 1000) {
        lng_mmin -= 1000;
        lng_min += 1;
    }

    s = lat_h +
        " " +
        this.zeropad(lat_deg, 2) +
        " " +
        this.zeropad(lat_min, 2) +
        "." +
        this.zeropad(lat_mmin, 3) +
        " " +
        lng_h +
        " " +
        this.zeropad(lng_deg, 3) +
        " " +
        this.zeropad(lng_min, 2) +
        "." +
        this.zeropad(lng_mmin, 3);
    return s;
};


Coordinates.toStringDMS = function (coords) {
    'use strict';

    var lat = coords.lat(),
        lat_h = "N",
        lat_deg,
        lat_min,
        lat_sec,
        lat_rest,
        lng = coords.lng(),
        lng_h = "E",
        lng_deg,
        lng_min,
        lng_sec,
        lng_rest,
        s;

    if (lat < 0) {
        lat_h = "S";
        lat = -lat;
    }
    lat_deg = Math.floor(lat);
    lat_rest = lat - lat_deg;
    lat_min = Math.floor(lat_rest * 60);
    lat_rest = lat_rest * 60 - lat_min;
    lat_sec = lat_rest * 60.0;

    if (lng < 0) {
        lng_h = "W";
        lng = -lng;
    }
    lng_deg = Math.floor(lng);
    lng_rest = lng - lng_deg;
    lng_min = Math.floor(lng_rest * 60);
    lng_rest = lng_rest * 60 - lng_min;
    lng_sec = lng_rest * 60.0;

    s = lat_h +
        " " +
        this.zeropad(lat_deg, 2) +
        " " +
        this.zeropad(lat_min, 2) +
        " " +
        this.zeropad(lat_sec.toFixed(2), 5) +
        " " +
        lng_h +
        " " +
        this.zeropad(lng_deg, 3) +
        " " +
        this.zeropad(lng_min, 2) +
        " " +
        this.zeropad(lng_sec.toFixed(2), 5);

    return s;
};


Coordinates.toStringD = function (coords) {
    'use strict';

    var lat = coords.lat(),
        lat_h = "N",
        lng = coords.lng(),
        lng_h = "E";

    if (lat < 0) {
        lat_h = "S";
        lat = -lat;
    }
    if (lng < 0) {
        lng_h = "W";
        lng = -lng;
    }

    return lat_h + " " + lat.toFixed(6) + " " + lng_h + " " + lng.toFixed(6);
};


Coordinates.toString = function (coords) {
    'use strict';

    if (this.m_format === "DM") {
        return this.toStringDM(coords);
    }

    if (this.m_format === "DMS") {
        return this.toStringDMS(coords);
    }

    if (this.m_format === "D") {
        return this.toStringD(coords);
    }

    return this.toStringDM(coords);
};


Coordinates.dist_angle_geodesic = function (startpos, endpos) {
    'use strict';

    var t = this.m_geod.Inverse(startpos.lat(), startpos.lng(), endpos.lat(), endpos.lng()),
        a = t.azi1;
    if (a < 0) {
        a += 360.0;
    }

    return { dist: t.s12, angle: a };
};


Coordinates.projection_geodesic = function (startpos, angle, distance) {
    'use strict';

    var t = this.m_geod.Direct(startpos.lat(), startpos.lng(), angle, distance);
    return new google.maps.LatLng(t.lat2, t.lon2);
};


Coordinates.zeropad = function (num, width) {
    'use strict';

    var s = String(num);
    while (s.length < width) {
        s = "0" + s;
    }
    return s;
};
