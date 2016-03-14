var freifunkInfoMode = false;
var freifunkInfoModeClickListener = null;

function toggleFreifunkLayer(t)
{
  if ($('#freifunk').is(':checked') != t)
  {
    $('#freifunk').attr('checked', t);
  }

  if (t) {
    $('#freifunk_details').show();
  } else {
    $('#freifunk_details').hide();
    endFreifunkInfoMode();
  }
  
/*
  if (freifunkLayerShown == t) return;
  freifunkLayerShown = t;

  if (t) {
    if (map.overlayMapTypes.indexOf(hillshadingLayer) == -1) {
        map.overlayMapTypes.insertAt(0, npaLayer);
    } else {
        map.overlayMapTypes.insertAt(1, npaLayer);
    }
  } else {
    map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(npaLayer));
  }
*/
}

function startFreifunkInfoMode() {
    if (freifunkInfoMode) return;
    freifunkInfoMode = true;

    map.setOptions({draggableCursor: 'crosshair'});
    freifunkInfoModeClickListener = google.maps.event.addListener(map, 'click', function(event) {
        showFreifunkPopup(event.latLng.lat(), event.latLng.lng());
        endFreifunkInfoMode();
    });
}


function endFreifunkInfoMode() {
    if (!freifunkInfoMode) return;
    freifunkInfoMode = false;

    map.setOptions({draggableCursor: ''});
    google.maps.event.removeListener(freifunkInfoModeClickListener);
}

function showFreifunkPopup(lat, lng) {
    var contentString =
        "<textarea readonly rows=5 cols=70>" + 
        "uci set gluon-node-info.@location[0]='location'\n" +
        "uci set gluon-node-info.@location[0].share_location='1'\n" +
        "uci set gluon-node-info.@location[0].latitude='" + lat + "'\n" +
        "uci set gluon-node-info.@location[0].longitude='" + lng + "'\n" +
        "uci commit" +
        "</textarea>";
    
    var infowindow = new google.maps.InfoWindow( { content: contentString, position: new google.maps.LatLng(lat, lng) } );
    infowindow.open(map);
}

function showFreifunkDialog()
{
  $('#dialogFreifunk').modal({show : true, backdrop: "static", keyboard: true});
}
