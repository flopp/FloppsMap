/*jslint
  nomen: false,
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

    return lat !== null && lat !== undefined && !isNaN(lat) && -90.0 <= lat && lat <= 90.0;
};


Coordinates.validLng = function (lng) {
    'use strict';

    return lng !== null && lng !== undefined && !isNaN(lng) && -180.0 <= lng && lng <= 180.0;
};


Coordinates.valid = function (lat, lng) {
    'use strict';

    return this.validLat(lat) && this.validLng(lng);
};


Coordinates.toLatLng = function (lat, lng) {
    'use strict';

    if (this.valid(lat, lng)) {
        return new google.maps.LatLng(lat, lng);
    }

    return null;
};


Coordinates.fromString = function (coordsString) {
    'use strict';

    var coords;

    coords = this.fromStringDM(coordsString);
    if (coords) {
        return coords;
    }

    coords = this.fromStringDMS(coordsString);
    if (coords) {
        return coords;
    }

    coords = this.fromStringD(coordsString);
    if (coords) {
        return coords;
    }

    return null;
};


Coordinates.sanitize = function (s) {
    'use strict';

    var sanitized = "",
        commas = 0,
        periods = 0,
        i;

    for (i = 0; i < s.length; i = i + 1) {
        if ((s[i] === 'o') || (s[i] === 'O')) {
            // map 'O'/'o' to 'E' (German 'Ost' = 'East')
            sanitized += 'E';
        } else if (s[i].match(/[a-z0-9\-]/i)) {
            sanitized += s[i].toUpperCase();
        } else if (s[i] === '.') {
            periods += 1;
            sanitized += s[i];
        } else if (s[i] === ',') {
            commas += 1;
            sanitized += s[i];
        } else {
            sanitized += ' ';
        }
    }

    // try to map commas to spaces or periods
    if ((commas === 1) && ((periods === 0) || (periods >= 2))) {
        return sanitized.replace(/,/g, ' ');
    }

    if ((commas >= 1) && (periods === 0)) {
        return sanitized.replace(/,/g, '.');
    }

    return sanitized;
};


Coordinates.create = function (h1, d1, m1, s1, h2, d2, m2, s2) {
    'use strict';

    var c1, c2, lat, lng;

    if (h1 && d1 < 0) {
        return null;
    }
    if (m1 < 0 || m1 >= 60) {
        return null;
    }
    if (s1 < 0 || s1 >= 60) {
        return null;
    }

    if (h2 && d2 < 0) {
        return null;
    }
    if (m2 < 0 || m2 >= 60) {
        return null;
    }
    if (s2 < 0 || s2 >= 60) {
        return null;
    }

    c1 = d1 + (m1 / 60.0) + (s1 / 3600.0);
    c2 = d2 + (m2 / 60.0) + (s2 / 3600.0);

    if (!h1 && !h2) {
        lat = c1;
        lng = c2;
    } else if ((h1 === 'N' || h1 === 'S') && (h2 === 'E' || h2 === 'W')) {
        lat = c1;
        lng = c2;
        if (h1 === 'S') {
            lat = -lat;
        }
        if (h2 === 'W') {
            lng = -lng;
        }
    } else if ((h2 === 'N' || h2 === 'S') && (h1 === 'E' || h1 === 'W')) {
        lat = c2;
        lng = c1;
        if (h2 === 'S') {
            lat = -lat;
        }
        if (h1 === 'W') {
            lng = -lng;
        }
    } else {
        return null;
    }

    if (!this.valid(lat, lng)) {
        return null;
    }

    return Coordinates.toLatLng(lat, lng);
};


Coordinates.fromStringDMS = function (coordsString) {
    'use strict';

    var s = this.sanitize(coordsString),
        pattern,
        m,
        coords;

    // H D M S.S
    pattern = /^\s*([NEWS])\s*(\d+)\s+(\d+)\s+(\d+\.?\d*)\s*([NEWS])\s*(\d+)\s+(\d+)\s+(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[1], parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]),
                                    m[5], parseFloat(m[6]), parseFloat(m[7]), parseFloat(m[8]));
        if (coords) {
            return coords;
        }
    }

    // D H M S.S
    pattern = /^\s*(\d+)\s*([NEWS])\s*(\d+)\s+(\d+\.?\d*)\s+(\d+)\s*([NEWS])\s*(\d+)\s+(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[2], parseFloat(m[1]), parseFloat(m[3]), parseFloat(m[4]),
                                    m[6], parseFloat(m[5]), parseFloat(m[7]), parseFloat(m[8]));
        if (coords) {
            return coords;
        }
    }

    // D M S.S H
    pattern = /^\s*(\d+)\s+(\d+)\s+(\d+\.?\d*)\s*([NEWS])\s*(\d+)\s+(\d+)\s+(\d+\.?\d*)\s*([NEWS])\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[4], parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]),
                                    m[8], parseFloat(m[5]), parseFloat(m[6]), parseFloat(m[7]));
        if (coords) {
            return coords;
        }
    }

    // D M S.S
    pattern = /^\s*(\d+)\s+(\d+)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+)\s+(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create('N', parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]),
                                    'E', parseFloat(m[4]), parseFloat(m[5]), parseFloat(m[6]));
        if (coords) {
            return coords;
        }
    }

    return null;
};


Coordinates.fromStringDM = function (coordsString) {
    'use strict';

    var s = this.sanitize(coordsString),
        pattern,
        m,
        coords;

    // H D M.M
    pattern = /^\s*([NEWS])\s*(\d+)\s+(\d+\.?\d*)\s*([NEWS])\s*(\d+)\s+(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[1], parseFloat(m[2]), parseFloat(m[3]), 0,
                                    m[4], parseFloat(m[5]), parseFloat(m[6]), 0);
        if (coords) {
            return coords;
        }
    }

    // D H M.M
    pattern = /^\s*(\d+)\s*([NEWS])\s*(\d+\.?\d*)\s+(\d+)\s*([NEWS])\s*(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[2], parseFloat(m[1]), parseFloat(m[3]), 0,
                                    m[5], parseFloat(m[4]), parseFloat(m[6]), 0);
        if (coords) {
            return coords;
        }
    }

    // D M.M H
    pattern = /^\s*(\d+)\s+(\d+\.?\d*)\s*([NEWS])\s*(\d+)\s+(\d+\.?\d*)\s*([NEWS])\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[3], parseFloat(m[1]), parseFloat(m[2]), 0,
                                    m[6], parseFloat(m[4]), parseFloat(m[5]), 0);
        if (coords) {
            return coords;
        }
    }

    // D M.M
    pattern = /^\s*(\d+)\s+(\d+\.?\d*)\s+(\d+)\s+(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create('N', parseFloat(m[1]), parseFloat(m[2]), 0,
                                    'E', parseFloat(m[3]), parseFloat(m[4]), 0);
        if (coords) {
            return coords;
        }
    }

    return null;
};


Coordinates.fromStringD = function (coordsString) {
    'use strict';

    var s = this.sanitize(coordsString),
        pattern,
        m,
        coords;

    // H D.D
    pattern = /^\s*([NEWS])\s*(\d+\.?\d*)\s*([NEWS])\s*(\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[1], parseFloat(m[2]), 0, 0,
                                     m[3], parseFloat(m[4]), 0, 0);
        if (coords) {
            return coords;
        }
    }

    // D.D H
    pattern = /^\s*(\d+\.?\d*)\s*([NEWS])\s*(\d+\.?\d*)\s*([NEWS])\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(m[2], parseFloat(m[1]), 0, 0,
                                     m[4], parseFloat(m[3]), 0, 0);
        if (coords) {
            return coords;
        }
    }

    // D.D
    pattern = /^\s*(-?\d+\.?\d*)\s+(-?\d+\.?\d*)\s*$/;
    m = s.match(pattern);
    if (m) {
        coords = Coordinates.create(null, parseFloat(m[1]), 0, 0,
                                     null, parseFloat(m[2]), 0, 0);
        if (coords) {
            return coords;
        }
    }

    return null;
};


Coordinates.toStringDM = function (coords) {
    'use strict';

    var lat = Math.abs(coords.lat()),
        lat_h = (coords.lat() >= 0) ? "N" : "S",
        lat_deg,
        lat_min,
        lat_mmin,
        lng = Math.abs(coords.lng()),
        lng_h = (coords.lng() >= 0) ? "E" : "W",
        lng_deg,
        lng_min,
        lng_mmin,
        s;

    lat_deg = Math.floor(lat);
    lat = lat - lat_deg;
    lat_min = Math.floor(lat * 60);
    lat = lat * 60 - lat_min;
    lat_mmin = Math.floor(Math.round(lat * 1000));
    while (lat_mmin >= 1000) {
        lat_mmin -= 1000;
        lat_min += 1;
    }

    lng_deg = Math.floor(lng);
    lng = lng - lng_deg;
    lng_min = Math.floor(lng * 60);
    lng = lng * 60 - lng_min;
    lng_mmin = Math.floor(Math.round(lng * 1000));
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

    var lat = Math.abs(coords.lat()),
        lat_h = ((coords.lat() >= 0) ? "N" : "S"),
        lat_deg,
        lat_min,
        lat_sec,
        lng = Math.abs(coords.lng()),
        lng_h = ((coords.lng() >= 0) ? "E" : "W"),
        lng_deg,
        lng_min,
        lng_sec,
        s;

    lat_deg = Math.floor(lat);
    lat = lat - lat_deg;
    lat_min = Math.floor(lat * 60);
    lat = lat * 60 - lat_min;
    lat_sec = lat * 60.0;

    lng_deg = Math.floor(lng);
    lng = lng - lng_deg;
    lng_min = Math.floor(lng * 60);
    lng = lng * 60 - lng_min;
    lng_sec = lng * 60.0;

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

    var lat = Math.abs(coords.lat()),
        lat_h = ((coords.lat() >= 0) ? "N" : "S"),
        lng = Math.abs(coords.lng()),
        lng_h = ((coords.lng() >= 0) ? "E" : "W");

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

    return {dist: t.s12, angle: a};
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
