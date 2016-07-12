var _npaLayer = null;
var _npaLayerShown = false;
var _npaInfoMode = false;
var _npaInfoModeClickListener = null;


function createNPALayer(themap) {
    var tileSize = 256;
    return new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            var proj = themap.getProjection();
            var zfactor = tileSize / Math.pow(2, zoom);
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * zfactor, coord.y * zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * zfactor, (coord.y + 1) * zfactor));
            var bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat();
            var url = "http://geodienste.bfn.de/ogc/wms/schutzgebiet?";
            url += "&REQUEST=GetMap";
            url += "&SERVICE=WMS";
            url += "&VERSION=1.3.0";
            url += "&LAYERS=Naturschutzgebiete";
            url += "&FORMAT=image/png";
            url += "&BGCOLOR=0xFFFFFF";
            url += "&STYLES=default";
            url += "&TRANSPARENT=TRUE";
            url += "&CRS=CRS:84";
            url += "&BBOX=" + bbox;
            url += "&WIDTH=" + tileSize;
            url += "&HEIGHT=" + tileSize;
            return url;
        },
        tileSize: new google.maps.Size(tileSize, tileSize),
        isPng: true,
        opacity: 0.6
    });
}


function requestNPAInfo(coords) {
    var url =
        'http://geodienste.bfn.de/ogc/wms/schutzgebiet?REQUEST=GetFeatureInfo&SERVICE=WMS&VERSION=1.3.0&CRS=CRS:84' +
        '&BBOX=' + coords.lng() + ',' + coords.lat() + ',' + (coords.lng()+0.001) + ',' + (coords.lat()+0.001) +
        '&WIDTH=256&HEIGHT=256&INFO_FORMAT=application/geojson&FEATURE_COUNT=1&QUERY_LAYERS=Naturschutzgebiete&X=0&Y=0';
    $.ajax({
        url: url,
        crossOrigin: true,
        proxy: 'proxy.php'
    }).done(function(data) {
        var obj = $.parseJSON(data);
        if (obj && obj.features && obj.features.length > 0) {
            var contentString =
                '<b>' + obj.features[0].properties.NAME + '</b><br/>' +
                mytrans("dialog.npa.cdda_code") + ' ' + obj.features[0].properties.CDDA_CODE + '<br />' +
                mytrans("dialog.npa.since") + ' ' + obj.features[0].properties.JAHR + '<br />' +
                mytrans("dialog.npa.area") + ' ' + obj.features[0].properties.FLAECHE + ' ha<br />';
            var infowindow = new google.maps.InfoWindow( { content: contentString, position: coords } );
            infowindow.open(map);
        } else {
            showAlert(mytrans("dialog.information"), mytrans("dialog.npa.msg_no_npa"));
        }
    }).fail(function() {
        showAlert(mytrans("dialog.error"), mytrans("dialog.npa.error"));
    });
}


function toggleNPALayer(t) {
    if ($('#npa').is(':checked') != t) {
        $('#npa').attr('checked', t);
    }

    if (t) {
        $('#npa_details').show();
    } else {
        $('#npa_details').hide();
        endNPAInfoMode();
    }

    if (_npaLayerShown == t) return;
    _npaLayerShown = t;

    if (t) {
        if (!_npaLayer) {
            _npaLayer = createNPALayer(map);
        }
        map.overlayMapTypes.push(_npaLayer);
    } else if (_npaLayer) {
        map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(_npaLayer));
    }
}


function showNPADialog() {
  $('#dialogNPA').modal({show : true, backdrop: "static", keyboard: true});
}


function startNPAInfoMode() {
    if (_npaInfoMode) return;

    map.setOptions({draggableCursor: 'crosshair'});
    _npaInfoMode = true;
    _npaInfoModeClickListener = google.maps.event.addListener(map, 'click', function(event) {
        requestNPAInfo(event.latLng);
        endNPAInfoMode();
    });
}


function endNPAInfoMode() {
    if (!_npaInfoMode) return;

    map.setOptions({draggableCursor: ''});
    _npaInfoMode = false;
    google.maps.event.removeListener(_npaInfoModeClickListener);
}
