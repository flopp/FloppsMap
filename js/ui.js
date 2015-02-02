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


///* hillshading */
//function toggleHillshading(t)
//{
  //$.cookie('hillshading', t ? "1" : "0", {expires:30});
  
  //if ($('#hillshading').is(':checked') != t)
  //{
    //$('#hillshading').attr('checked', t);
  //}
  
  //if( hillshadingLayerShown == t ) return;
  
  //hillshadingLayerShown = t;
  //map.overlayMapTypes.setAt(0, t ? hillshadingLayer : null);
//}

//function restoreHillshading(defaultValue)
//{
  //var state = get_cookie_string("hillshading", "invalid");
  
  //if (state == "0")
  //{
    //toggleHillshading(false);
  //}
  //else if (state == "1")
  //{
    //toggleHillshading(true);
  //}
  //else
  //{
    //toggleHillshading(defaultValue);
  //}
//}

/* boundary layer */
function toggleBoundaryLayer(t)
{
  $.cookie('boundaries', t ? "1" : "0", {expires:30});
  
  if ($('#showKreisgrenzen').is(':checked') != t)
  {
    $('#showKreisgrenzen').attr('checked', t);
  }
  
  if( t )
  {
    boundary_layer = new google.maps.FusionTablesLayer( {
      query: {
        select: 'geometry',
        from: boundary_layer_fusion_table
      },
      styles: [{
        polygonOptions: {
          fillColor: '#0000FF',
          fillOpacity: 0.01,
          strokeColor: '#0000FF',
          strokeOpacity: 1,
          strokeWeight: 2
        }
      }],
      clickable: false,
      suppressInfoWindows: true,
      map: map
    });
  }
  else
  {
    if (boundary_layer != null) 
    {
      boundary_layer.setMap(null);
      boundary_layer = null;
    }
  }
}

function restoreBoundaryLayer(defaultValue)
{
  var state = get_cookie_string("boundaries", "invalid");
  
  if (state == "0")
  {
    toggleBoundaryLayer(false);
  }
  else if (state == "1")
  {
    toggleBoundaryLayer(true);
  }
  else
  {
    toggleBoundaryLayer(defaultValue);
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
function showAlert( title, msg ) 
{
  $("#dlgAlertHeader").html( title );
  $("#dlgAlertMessage").html( msg );
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


/* setup button events */
$(document).ready(function() {
  $("#sidebartoggle").click(function() { if ($('#sidebar').is(':visible')) hideSidebar(); else showSidebar(); });      
  //$("#hillshading").click(function() { toggleHillshading($('#hillshading').is(':checked')); });        
  $("#showKreisgrenzen").click(function() { toggleBoundaryLayer($('#showKreisgrenzen').is(':checked')); });
  $("#showCaches").click(function() { okapi_toggle_load_caches($('#showCaches').is(':checked')); });
  $('#coordinatesFormat').change(function() { setCoordinatesFormat($('#coordinatesFormat').val()); });
});
