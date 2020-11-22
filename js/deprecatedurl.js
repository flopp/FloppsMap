/*jslint
  indent: 4
*/

/*global
  $
*/

function showDeprecatedUrlDialog(url) {
    'use strict';

    $('#deprecatedUrlDialogUrlEnglish').html(url);
    $('#deprecatedUrlDialogUrlGerman').html(url);
    $("#deprecatedUrlDialog").modal({show: true, backdrop: "static", keyboard: true});
}
