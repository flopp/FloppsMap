/*jslint
  regexp: true,
  indent: 4
*/

/*global
  Cookies,
  App, Conversion, Coordinates,
  alpha2id
*/

var Storage = {};


Storage.set = function (key, value) {
    'use strict';

    Cookies.set(key, value, {expires: 30});
};


Storage.getString = function (key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return s;
    }

    return default_value;
};


Storage.getInt = function (key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return parseInt(s, 10);
    }

    return default_value;
};


Storage.getFloat = function (key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return parseFloat(s);
    }

    return default_value;
};


Storage.parseMarkers = function () {
    'use strict';

    var raw_ids = Storage.getString('markers', null);

    if (!raw_ids) {
        return [];
    }

    return raw_ids.split(':').map(function (id_string) {
        var m = {id: null, name: null, coords: null, r: 0, color: ""},
            raw_data,
            data;

        m.id = Conversion.getInteger(id_string, 0, 26 * 10);
        if (m.id === null) {
            return null;
        }

        raw_data = Cookies.get('marker' + m.id);
        if (!raw_data) {
            return null;
        }

        data = raw_data.split(':');
        if (data.length !== 4 && data.length !== 5) {
            return null;
        }

        m.coords = Coordinates.toLatLng(parseFloat(data[0]), parseFloat(data[1]));
        if (!m.coords) {
            return null;
        }

        m.r = App.repairRadius(parseFloat(data[2]), 0);

        if ((/^([a-zA-Z0-9\-_]*)$/).test(data[3])) {
            m.name = data[3];
        }

        if (data.length === 5 && (/^([a-fA-F0-9]{6})$/).test(data[4])) {
            m.color = data[4];
        }

        return m;
    }).filter(function (thing) {
        return (thing !== null);
    });
};


Storage.parseLines = function () {
    'use strict';

    var raw_lines = Storage.getString('lines', null);

    if (!raw_lines) {
        return [];
    }

    return raw_lines.split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            return {source: alpha2id(pair[0]), target: alpha2id(pair[1])};
        }
        return null;
    }).filter(function (thing) {
        return (thing !== null);
    });
};
