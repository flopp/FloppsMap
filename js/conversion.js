/*jslint
  regexp: true
  indent: 4
*/

var Conversion = {};


Conversion.getFloat = function (s, min, max) {
    'use strict';

    var pattern = /^[+\-]?(([0-9]+)|([0-9]+\.[0-9]*)|([0-9]*\.[0-9]+))$/,
        v;

    s = s.trim();
    if (!s.match(pattern)) {
        return null;
    }

    v = parseFloat(s);
    if (v === null || isNaN(v) || v < min || v > max) {
        return null;
    }

    return v;
};


Conversion.getInteger = function (s, min, max) {
    'use strict';

    var pattern = /^[+\-]?[0-9]+$/,
        v;

    s = s.trim();
    if (!s.match(pattern)) {
        return null;
    }

    /* specify radix=10, otherwise numbers with leading zeros are interpreted as octal numbers */
    v = parseInt(s, 10);
    if (v === null || isNaN(v) || v < min || v > max) {
        return null;
    }

    return v;
};
