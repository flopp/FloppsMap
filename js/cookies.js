/*jslint
  regexp: true,
  indent: 4
*/

/*global
  Cookies
*/

function get_cookie_string(key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return s;
    }

    return default_value;
}


function get_cookie_int(key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return parseInt(s, 10);
    }

    return default_value;
}


function get_cookie_float(key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    if (s !== undefined) {
        return parseFloat(s);
    }

    return default_value;
}
