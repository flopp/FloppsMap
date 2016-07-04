function showMulticoordinatesDialog() {
    $('#multicoordinatesDialogOk').off( 'click' );
    $('#multicoordinatesDialogOk').click(function(){
        var text = $('#multicoordinatesDialogText').val();
        console.log(text);
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        $('#multicoordinatesDialog').modal('hide');
    });

    $('#multicoordinatesDialog').modal({show : true, backdrop: "static", keyboard: true});
    $('#multicoordinatesDialogText').select();
}
