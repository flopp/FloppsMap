/*jslint
  indent: 4
*/

/*global
  $, Coordinates, mytrans, showAlert, Markers
*/

function showMulticoordinatesDialog() {
    'use strict';

    $('#multicoordinatesDialogOk').off('click');
    $('#multicoordinatesDialogOk').click(function () {
        var prefix = $('#multicoordinatesPrefix').val(),
            text = $('#multicoordinatesDialogText').val(),
            strings = text.split(/;|\n/),
            errorsArray = [],
            coordsArray = [],
            len,
            i;

        if (!(/^([a-zA-Z0-9-_]*)$/.test(prefix))) {
            errorsArray.push(mytrans("dialog.multicoordinates.error_badprefix").replace('%1', prefix));
        }
        strings.map(function (s) {
            s = s.trim();
            if (!s.length) {
                return;
            }

            var c = Coordinates.fromString(s);
            if (!c) {
                errorsArray.push(mytrans("dialog.multicoordinates.error_badcoordinates").replace('%1', s));
                return;
            }

            coordsArray.push(c);
        });

        len = coordsArray.length;
        if (len >= Markers.getFreeMarkers()) {
            errorsArray.push(mytrans("dialog.multicoordinates.error_maxmarkers").replace('%1', Markers.getFreeMarkers()));
        }

        if (errorsArray.length > 0) {
            $('#multicoordinatesError').html(mytrans("dialog.multicoordinates.error_message").replace('%1', errorsArray.join("<br />")));
            //showAlert(mytrans("dialog.multicoordinates.title"), mytrans("dialog.multicoordinates.error_message").replace('%1', errorsArray.join("<br />")));
        } else {
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $('#multicoordinatesDialog').modal('hide');

            for (i = 0; i < len; i += 1) {
                if (!Markers.newMarker(coordsArray[i], -1, 0, prefix + i)) {
                    showAlert(mytrans("dialog.multicoordinates.title"), mytrans("dialog.multicoordinates.error_message").replace('%1', '???'));
                    break;
                }
            }
        }
    });

    $('#multicoordinatesDialog').modal({show : true, backdrop: "static", keyboard: true});
    $('#multicoordinatesError').html('');
    $('#multicoordinatesDialogText').select();
}
