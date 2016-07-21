/*jslint
  indent: 4
*/

function id2alpha(id) {
    'use strict';

    if (id >= 0 && id < 26) {
        return String.fromCharCode('A'.charCodeAt() + (id % 26));
    }

    if (id >= 26 && id < 260) {
        return String.fromCharCode('A'.charCodeAt() + (id % 26)) + String.fromCharCode('0'.charCodeAt() + (id / 26));
    }

    return "";
}


function alpha2id(alpha) {
    'use strict';

    alpha = alpha.toLowerCase();

    if (/^[a-z]$/.test(alpha)) {
        return alpha.charCodeAt(0) - 'a'.charCodeAt(0);
    }

    if (/^[a-z][0-9]$/.test(alpha)) {
        return (alpha.charCodeAt(0) - 'a'.charCodeAt(0)) + 26 * (alpha.charCodeAt(1) - '0'.charCodeAt(0));
    }

    return -1;
}
