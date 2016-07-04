function showMulticoordinatesDialog() {
    $('#multicoordinatesDialogOk').off( 'click' );
    $('#multicoordinatesDialogOk').click(function(){
        var text = $('#multicoordinatesDialogText').val();
        var strings = text.split(/;|\n/);
        var errorsArray = [];
        var coordsArray = [];

        var len = strings.length;
        for (var i = 0; i < len; i++) {
            var s = strings[i].trim();
            if (s.length == 0) continue;

            var c = Coordinates.fromString(s);
            if (!c) {
                errorsArray.push(mytrans("dialog.multicoordinates.error_badcoordinates").replace('%1', s));
                continue;
            }

            coordsArray.push(c);
        }

        len = coordsArray.length;
        for (var i = 0; i < len; i++) {
            var c = coordsArray[i];
            var name = "MULTI_" + i;
            if (!newMarker(c, -1, 0, name)) {
                errorsArray.push(mytrans("dialog.multicoordinates.error_maxmarkers"));
                break;
            }
        }

        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('#multicoordinatesDialog').modal('hide');

        if (errorsArray.length > 0) {
            showAlert(mytrans("dialog.multicoordinates.title"), mytrans("dialog.multicoordinates.error_message").replace('%1', errorsArray.join("<br />")));
        }
    });

    $('#multicoordinatesDialog').modal({show : true, backdrop: "static", keyboard: true});
    $('#multicoordinatesDialogText').select();
}
