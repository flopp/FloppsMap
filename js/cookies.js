/*jslint
  regexp: true
  indent: 4
*/

/*global
  Cookies
*/

function get_cookie_string(key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    return (s !== undefined) ? s : default_value;
}

function get_cookie_int(key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    return (s !== undefined) ? parseInt(s, 10) : default_value;
}

function get_cookie_float(key, default_value) {
    'use strict';

    var s = Cookies.get(key);
    return (s !== undefined) ? parseFloat(s) : default_value;
}
