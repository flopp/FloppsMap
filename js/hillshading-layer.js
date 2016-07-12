var _hillshadingLayer = null;
var _hillshadingLayerShown = false;


function createHillshadingLayer(themap) {
    var tileSize = 256;
    var url = 'http://%s.tiles.wmflabs.org/hillshading/%z/%x/%y.png';

    return new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            if (6 <= zoom && zoom <= 15) {
                return tileUrl(url, ['a', 'b', 'c'], coord, zoom);
            } else {
                return null;
            }
        },
        tileSize: new google.maps.Size(tileSize, tileSize),
        name: "hill",
        alt: "Hillshading",
        maxZoom: 15
    });
}


function toggleHillshading(t) {
  Cookies.set('hillshading', t ? "1" : "0", {expires:30});

  if ($('#hillshading').is(':checked') != t) {
    $('#hillshading').attr('checked', t);
  }

  if (_hillshadingLayerShown == t) return;
  _hillshadingLayerShown = t;

  if (t) {
    if (!_hillshadingLayer) {
        _hillshadingLayer = createHillshadingLayer(map);
    }
    map.overlayMapTypes.insertAt(0, _hillshadingLayer);
  } else if (_hillshadingLayer) {
    map.overlayMapTypes.removeAt(map.overlayMapTypes.indexOf(_hillshadingLayer));
  }
}


function restoreHillshading(defaultValue) {
  var state = get_cookie_string("hillshading", "invalid");
  if (state == "0") {
    toggleHillshading(false);
  } else if (state == "1") {
    toggleHillshading(true);
  } else {
    toggleHillshading(defaultValue);
  }
}
