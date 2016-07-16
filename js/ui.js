///* boundaries layer */
//function toggleBoundaries(t)
//{
//  Cookies.set('boundaries', t ? "1" : "0", {expires:30});
//
//  if ($('#boundaries').is(':checked') != t)
//  {
//    $('#boundaries').attr('checked', t);
//  }
//
//  if( boundariesLayerShown == t ) return;
//  boundariesLayerShown = t;
//
//  if (t) {
//    map.overlayMapTypes.push(boundariesLayer);
//  } else {
//    map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(boundariesLayer));
//  }
//}
//
//function restoreBoundaries(defaultValue)
//{
//  var state = get_cookie_string("boundaries", "invalid");
//
//  if (state == "0")
//  {
//    toggleBoundaries(false);
//  }
//  else if (state == "1")
//  {
//    toggleBoundaries(true);
//  }
//  else
//  {
//    toggleBoundaries(defaultValue);
//  }
//}


/* coordinate format */
function setCoordinatesFormat(t)
{
  Cookies.set('coordinatesFormat', t, {expires:30});

  if ($('#coordinatesFormat').val() != t)
  {
    $('#coordinatesFormat').val(t);
  }

  Coordinates.setFormat(t);

  theMarkers.update();
}

function restoreCoordinatesFormat(defaultValue)
{
  var t = get_cookie_string("coordinatesFormat", "DM");

  if (t == "DM" || t == "DMS" || t == "D")
  {
    setCoordinatesFormat(t);
  }
  else
  {
    setCoordinatesFormat("DM");
  }
}


/* info dialog */
function showInfoDialog()
{
  $('#dlgInfoAjax').modal({show : true, backdrop: "static", keyboard: true});
}

/* alert dialog */
function showAlert(title, msg)
{
  $("#dlgAlertHeader").html(title);
  $("#dlgAlertMessage").html(msg);
  $("#dlgAlert").modal({show : true, backdrop: "static", keyboard: true});
}

/* projection dialog */
function showProjectionDialog(callback)
{
  $('#projectionDialogOk').off( 'click' );
  $('#projectionDialogOk').click(function(){
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#projectionDialog').modal('hide');
    if (callback)
    {
      setTimeout(function(){callback($("#projectionBearing").val(), $("#projectionDistance").val());}, 10);
    }
  });
  $("#projectionDialog").modal({show : true, backdrop: "static", keyboard: true});
}

/* permalink dialog */
function showLinkDialog(linkUrl)
{
  $('#linkDialogLink').val(linkUrl);
  $('#linkDialog').modal({show : true, backdrop: "static", keyboard: true});
  $('#linkDialogLink').select();
}

function linkDialogShortenLink()
{
  var longUrl = $('#linkDialogLink').val();
  gapi.client.setApiKey('AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0');

  gapi.client.load('urlshortener', 'v1', function() {
    var request = gapi.client.urlshortener.url.insert({'resource': {'longUrl': longUrl}});
    var resp = request.execute(function(resp) {
      if (resp.error)
      {
        $('#linkDialogError').html('Error: ' + resp.error.message);
      }
      else
      {
        $('#linkDialogLink').val(resp.id);
        $('#linkDialogLink').select();
      }
    });
  });
}

//function showHillshadingDialog()
//{
//  $('#dialogHillshading').modal({show : true, backdrop: "static", keyboard: true});
//}

//function showBoundariesDialog()
//{
//  $('#dialogBoundaries').modal({show : true, backdrop: "static", keyboard: true});
//}


/* setup button events */
$(document).ready(function() {
  $("#sidebartoggle").click(function() { if ($('#sidebar').is(':visible')) Sidebar.hide(); else Sidebar.show(); });
  //$('#buttonWhereAmI').click(function() { Geolocation.whereAmI(); });
  $("#hillshading").click(function() { Hillshading.toggle($('#hillshading').is(':checked')); });
  //$("#boundaries").click(function() { toggleBoundaries($('#boundaries').is(':checked')); });
  $("#npa").click(function() { NPA.toggle($('#npa').is(':checked')); });
  $("#cdda").click(function() { CDDA.toggle($('#cdda').is(':checked')); });
  $("#geocaches").click(function() { okapi_toggle_load_caches($('#geocaches').is(':checked')); });
  $('#coordinatesFormat').change(function() { setCoordinatesFormat($('#coordinatesFormat').val()); });
  $("#freifunk").click(function() { Freifunk.toggle($('#freifunk').is(':checked')); });
  $("#buttonUploadGPX").click(function(e) { $("#buttonUploadGPXinput").click(); e.preventDefault(); });
  $("#buttonMulticoordinates").click(function() { showMulticoordinatesDialog(); });
});
