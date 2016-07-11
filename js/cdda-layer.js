_cddaInfoMode = false;
_cddaInfoModeClickListener = null;

function createCDDALayer(themap) {
    var tileSize = 256;
    return new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            var proj = themap.getProjection();
            var zfactor = tileSize / Math.pow(2, zoom);
            var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * zfactor, coord.y * zfactor));
            var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * zfactor, (coord.y + 1) * zfactor));
            var bbox = top.lng() + "," + bot.lat() + "," + bot.lng() + "," + top.lat();
            var url = "http://bio.discomap.eea.europa.eu/arcgis/rest/services/ProtectedSites/CDDA_Dyna_WM/MapServer/export?";
            url += "dpi=96";
            url += "&transparent=true";
            url += "&format=png32";
            url += "&layers=show%3A0%2C1%2C2%2C3%2C4";
            url += "&BBOX=" + bbox;
            url += "&bboxSR=4326";
            url += "&size=" + tileSize + "%2C" + tileSize;
            url += "&f=image";
            return url;
        },
        tileSize: new google.maps.Size(tileSize, tileSize),
        isPng: true,
        opacity: 0.6
    });
}

function getCDDAInfo(themap, coords) {
    var url = "http://bio.discomap.eea.europa.eu/arcgis/rest/services/ProtectedSites/CDDA_Dyna_WM/MapServer/identify";
    url += "?geometry=" + coords.lng() + "%2C" + coords.lat();
    url += "&geometryType=esriGeometryPoint";
    url += "&sr=4326";
    url += "&layers=all";
    url += "&returnGeometry=false";
    url += "&tolerance=1";
    url += "&mapExtent=1";
    url += "&imageDisplay=1";
    url += "&f=json";

    $.ajax({
        url: url,
        timeout: 3000
    })
    .done(function(data) {
        var obj = $.parseJSON(data);
        
        var name = "";
        var type = "";
        var year = "";
        
        if (obj && obj.results) {
            for (var i = 0; i < obj.results.length; i++) {
                var res = obj.results[i];
                if (!res.attributes || !res.attributes.SITE_NAME) {
                    continue;
                }                

                name = res.attributes.SITE_NAME;
                if (res.attributes.YEAR) {
                    year = res.attributes.YEAR;
                }
                if (res.attributes.DESIGNATE) {
                    type = res.attributes.DESIGNATE;
                }
                if (res.attributes.ODESIGNATE) {
                    if (type != "") {
                        type += " (" + res.attributes.ODESIGNATE + ")";
                    } else {
                        type = res.attributes.ODESIGNATE;
                    }
                }
                break;
            }
        }
        
        if (name != "") {
            var content =
                '<b>' + name + '</b><br/>' +
                type + '<br />' +
                year;
            var infowindow = new google.maps.InfoWindow( { content: content, position: coords } );
            infowindow.open(themap);
        } else {
            showAlert(mytrans("dialog.information"), mytrans("dialog.cdda.msg_no_data"));
        }
    })
    .fail(function() {
        showAlert(mytrans("dialog.information"), mytrans("dialog.cdda.msg_failed"));
    })
}


function startCDDAInfoMode(themap) {
    if (_cddaInfoMode) return;

    themap.setOptions({draggableCursor: 'help'});
    _cddaInfoMode = true;
    _cddaInfoModeClickListener = google.maps.event.addListener(themap, 'click', function(event) {
        getCDDAInfo(themap, event.latLng);
        endCDDAInfoMode(themap);
    });
}


function endCDDAInfoMode(themap) {
    if (!_cddaInfoMode) return;

    themap.setOptions({draggableCursor: ''});
    _cddaInfoMode = false;
    google.maps.event.removeListener(_cddaInfoModeClickListener);
}
