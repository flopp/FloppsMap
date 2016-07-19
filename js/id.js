/*jslint
  indent: 4
*/

function id2alpha(id) {
    'use strict';

    if (id >= 0 && id < 26) {
        return String.fromCharCode('A'.charCodeAt() + (id % 26));
    }
    if (id >= 26 && id < 260) {
        return String.fromCharCode('A'.charCodeAt() + (id % 26)) +
            String.fromCharCode('0'.charCodeAt() + (id / 26));
    }

    return "";
}


function alpha2id(alpha) {
    'use strict';

    if (alpha.length < 1 || alpha.length > 2) {
        return -1;
    }

    alpha = alpha.toLowerCase();
    var letter = 0,
        number = 0;

    if (alpha[0] >= 'a' && alpha[0] <= 'z') {
        letter = alpha.charCodeAt(0) - 'a'.charCodeAt(0);
    } else {
        return -1;
    }

    if (alpha.length === 2) {
        if (alpha[1] >= '0' && alpha[1] <= '9') {
            number = alpha.charCodeAt(1) - '0'.charCodeAt(0);
        } else {
            return -1;
        }
    }

    return number * 26 + letter;
}
