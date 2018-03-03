/*jslint
  regexp: true,
  indent: 4
*/

/*global
  window,
  Cookies,
  Conversion, Coordinates,
  alpha2id
*/

var Persist = {};


Persist.init = function () {
    'use strict';

    // check if localStorage is available
    Persist.m_hasLocalStorage = true;
    try {
        var x = '__Persist_test__';
        window.localStorage.setItem(x, x);
        window.localStorage.removeItem(x);
    } catch (e) {
        Persist.m_hasLocalStorage = false;
    }

    Persist.migrate();
};


Persist.migrate = function () {
    'use strict';

    if (!Persist.m_hasLocalStorage) {
        return;
    }

    // not migrated, yet -> copy cookies to localStorage
    if (Persist.getValueFromLocalStorage('version', null) === null) {
        Persist.setValueInLocalStorage('version', '1');

        // migrate individual markers
        Persist.getValueFromCookie('markers', '').split(':').map(function (id_string) {
            var key = 'marker' + Conversion.getInteger(id_string, 0, 26 * 10);
            Persist.setValueInLocalStorage(key, Persist.getValueFromCookie(key, null));
            Cookies.remove(key);
        });

        // read from Cookies, write to localStorage
        ['clat', 'clon', 'zoom', 'maptype',
            'coordinatesFormat',
            'hillshading', 'load_caches', 'sidebar',
            'lines', 'markers'].map(function (key) {
            Persist.setValueInLocalStorage(key, Persist.getValueFromCookie(key, null));
            Cookies.remove(key);
        });

    }
};


Persist.setValue = function (key, value) {
    'use strict';

    if (Persist.m_hasLocalStorage) {
        Persist.setValueInLocalStorage(key, value);
    } else {
        Persist.setValueInCookie(key, value);
    }
};


Persist.setValueInCookie = function (key, value) {
    'use strict';

    if (value !== null) {
        Cookies.set(key, value, {expires: 30});
    } else {
        Cookies.remove(key);
    }
};


Persist.setValueInLocalStorage = function (key, value) {
    'use strict';

    if (value !== null) {
        window.localStorage.setItem(key, String(value));
    } else {
        window.localStorage.removeItem(key);
    }
};


Persist.getValue = function (key, default_value) {
    'use strict';

    if (Persist.m_hasLocalStorage) {
        return Persist.getValueFromLocalStorage(key, default_value);
    }
    return Persist.getValueFromCookie(key, default_value);
};


Persist.getValueFromCookie = function (key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return s;
    }
    return default_value;
};


Persist.getValueFromLocalStorage = function (key, default_value) {
    'use strict';

    var s = window.localStorage.getItem(key);
    if (s !== null) {
        return s;
    }
    return default_value;
};


Persist.getInt = function (key, default_value) {
    'use strict';

    var s = Persist.getValue(key, null);
    if (s !== null) {
        return parseInt(s, 10);
    }

    return default_value;
};


Persist.getFloat = function (key, default_value) {
    'use strict';

    var s = Persist.getValue(key, null);
    if (s !== null) {
        return parseFloat(s);
    }

    return default_value;
};


Persist.parseMarkers = function () {
    'use strict';

    return Persist.getValue('markers', '').split(':').map(function (id_string) {
        var m = {id: null, name: null, coords: null, r: 0, color: ""},
            raw_data,
            data;

        m.id = Conversion.getInteger(id_string, 0, 26 * 10);
        if (m.id === null) {
            return null;
        }

        raw_data = Persist.getValue('marker' + m.id, null);
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

        m.r = parseFloat(data[2]);
        if (m.r === null || isNaN(m.r) || m.r < 0 || m.r > 100000000) {
            m.r = 0;
        }

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


Persist.parseLines = function () {
    'use strict';

    return Persist.getValue('lines', '').split('*').map(function (pair_string) {
        var pair = pair_string.split(':');
        if (pair.length === 2) {
            return {source: alpha2id(pair[0]), target: alpha2id(pair[1])};
        }
        return null;
    }).filter(function (thing) {
        return (thing !== null);
    });
};
