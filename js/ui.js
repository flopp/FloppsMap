/* sidebar */

function hideSidebar()
{
  $.cookie("sidebar", "hidden", {expires: 30});
  $('#sidebar').hide();
  $('#sidebartoggle').css( "right", "0px" );
  $('#sidebartogglebutton').html( "<i class=\"fa fa-chevron-left\"></i>" );
  $('#map-wrapper').css("right", "0px");
  google.maps.event.trigger(map, "resize");
}

function showSidebar()
{
  $.cookie("sidebar", "shown", {expires: 30});
  $('#sidebar').show();
  $('#sidebartoggle').css( "right", "280px" );
  $('#sidebartogglebutton').html( "<i class=\"fa fa-chevron-right\"></i>" );
  $('#map-wrapper').css("right", "280px");
  google.maps.event.trigger(map, "resize");
}

function toggleSidebar(shown)
{
  if (shown) showSidebar();
  else       hideSidebar();
} 

function restoreSidebar(defaultValue)
{
  var state = get_cookie_string("sidebar", "invalid");
  if (state == "hidden" )
  {
    hideSidebar();
  }
  else if (state == "shown")
  {
    showSidebar();
  }
  else
  {
    toggleSidebar(defaultValue);
  }
}


/* hillshading */
function toggleHillshading(t)
{
  $.cookie('hillshading', t ? "1" : "0", {expires:30});
  
  if ($('#hillshading').is(':checked') != t)
  {
    $('#hillshading').attr('checked', t);
  }
  
  if( hillshadingLayerShown == t ) return;
  hillshadingLayerShown = t;
  
  if (t) {
    map.overlayMapTypes.insertAt(0, hillshadingLayer);
  } else {
    map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(hillshadingLayer));
  }
}

function restoreHillshading(defaultValue)
{
  var state = get_cookie_string("hillshading", "invalid");
  
  if (state == "0")
  {
    toggleHillshading(false);
  }
  else if (state == "1")
  {
    toggleHillshading(true);
  }
  else
  {
    toggleHillshading(defaultValue);
  }
}

/* boundaries layer */
function toggleBoundaries(t)
{
  $.cookie('boundaries', t ? "1" : "0", {expires:30});
  
  if ($('#boundaries').is(':checked') != t)
  {
    $('#boundaries').attr('checked', t);
  }
  
  if( boundariesLayerShown == t ) return;
  boundariesLayerShown = t;
  
  if (t) {
    map.overlayMapTypes.push(boundariesLayer);
  } else {
    map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(boundariesLayer));
  }
}

function restoreBoundaries(defaultValue)
{
  var state = get_cookie_string("boundaries", "invalid");
  
  if (state == "0")
  {
    toggleBoundaries(false);
  }
  else if (state == "1")
  {
    toggleBoundaries(true);
  }
  else
  {
    toggleBoundaries(defaultValue);
  }
}

function toggleNaturschutzgebiete(t)
{
  if ($('#naturschutzgebiete').is(':checked') != t)
  {
    $('#naturschutzgebiete').attr('checked', t);
  }
 
  if (t) {
    $('#nsg_details').show();
  } else {
    $('#nsg_details').hide();
  }
  
  if (naturschutzgebieteLayerShown == t) return;
  naturschutzgebieteLayerShown = t;
  
  
  if (t) {
    if (map.overlayMapTypes.indexOf(hillshadingLayer) == -1) {
        map.overlayMapTypes.insertAt(0, naturschutzgebieteLayer);
    } else {
        map.overlayMapTypes.insertAt(1, naturschutzgebieteLayer);
    }
  } else {
    map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(naturschutzgebieteLayer));
  }
}

/* coordinate format */
function setCoordinatesFormat(t)
{
  $.cookie('coordinatesFormat', t, {expires:30});
  
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

function showHillshadingDialog()
{
  $('#dialogHillshading').modal({show : true, backdrop: "static", keyboard: true});
}

function showBoundariesDialog()
{
  $('#dialogBoundaries').modal({show : true, backdrop: "static", keyboard: true});
}

function showNaturschutzgebieteDialog()
{
  $('#dialogNaturschutzgebiete').modal({show : true, backdrop: "static", keyboard: true});
}

/* setup button events */
$(document).ready(function() {
  $("#sidebartoggle").click(function() { if ($('#sidebar').is(':visible')) hideSidebar(); else showSidebar(); });      
  $("#hillshading").click(function() { toggleHillshading($('#hillshading').is(':checked')); });        
  $("#boundaries").click(function() { toggleBoundaries($('#boundaries').is(':checked')); });
  $("#naturschutzgebiete").click(function() { toggleNaturschutzgebiete($('#naturschutzgebiete').is(':checked')); });
  $("#showCaches").click(function() { okapi_toggle_load_caches($('#showCaches').is(':checked')); });
  $('#coordinatesFormat').change(function() { setCoordinatesFormat($('#coordinatesFormat').val()); });
  $('#buttonWhereAmI').click(function() { theGeolocation.whereAmI(); });
});
