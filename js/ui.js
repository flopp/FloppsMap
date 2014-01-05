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
  $('#sidebartoggle').css( "right", "264px" );
  $('#sidebartogglebutton').html( "<i class=\"fa fa-chevron-right\"></i>" );
  $('#map-wrapper').css("right", "264px");
  google.maps.event.trigger(map, "resize");
}

function toggleSidebar(shown)
{
  if (shown) showSidebar();
  else       hideSidebar();
} 

function restoreSidebar()
{
  var state = get_cookie_string("sidebar", "shown");
  toggleSidebar(state != "hidden");
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
  $("#hillshading").click(function() { toggleHillshadingLayer($('#hillshading').is(':checked')); });        
  $("#showKreisgrenzen").click(function() { toggleBoundaryLayer($('#showKreisgrenzen').is(':checked')); });
  $("#showCaches").click(function() { okapi_toggle_load_caches($('#showCaches').is(':checked')); });
/*        
  $("#showNSG").click(function() { showNSGLayer( $('#showNSG').is(':checked') ); });
*/        
});
