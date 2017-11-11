/*jslint
  indent: 4
*/

function id2alpha(id) {
    'use strict';

    var s = 'A0',
        indexA = s.charCodeAt(0),
        index0 = s.charCodeAt(1);

    if (id >= 0 && id < 26) {
        return String.fromCharCode(indexA + (id % 26));
    }

    if (id >= 26 && id < 260) {
        return String.fromCharCode(indexA + (id % 26)) + String.fromCharCode(index0 + (id / 26));
    }

    return "";
}


function alpha2id(alpha) {
    'use strict';

    var s = 'A0',
        indexA = s.charCodeAt(0),
        index0 = s.charCodeAt(1);

    alpha = alpha.toUpperCase();

    if (/^[A-Z]$/.test(alpha)) {
        return alpha.charCodeAt(0) - indexA;
    }

    if (/^[A-Z][0-9]$/.test(alpha)) {
        return (alpha.charCodeAt(0) - indexA) + 26 * (alpha.charCodeAt(1) - index0);
    }

    return -1;
}
