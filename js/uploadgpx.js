/*jslint
  indent: 4
*/

function handleGpxFiles(files) {
  if (!files || files.length == 0) return;

  var file = files[0];
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onloadend = function(){
    var parser = new DOMParser();
    xml = parser.parseFromString(reader.result, "text/xml")
    if (!xml) return;

    wpts = xml.getElementsByTagName('wpt');
    for (i = 0; i < wpts.length; i++) {
        var wpt = wpts[i];
        var lat = wpt.getAttribute('lat');
        var lon = wpt.getAttribute('lon');
        var radius = 0;

        var name = '';
        var nameEl = wpt.getElementsByTagName('name');
        if (nameEl.length > 0) {
            name = nameEl[0].textContent;
        }
        name = name.replace(/[^A-Za-z0-9_-]/gi, '');
        if (name == '') name = 'wpt_' + i;

        var extEl = wpt.getElementsByTagName('*');
        for (j = 0; j < extEl.length; j++) {
            var ext = extEl[j];
            if (ext.tagName == 'wptx1:Proximity') {
              radius = parseInt(ext.textContent);
              break;
            }
        }

        console.log("lat", lat, "lon", lon, "name", name, "radius", radius);
        if (!newMarker(new google.maps.LatLng(lat, lon), -1, radius, name)) {
          return;
        }
    };
  }

  // reset file input
  var $el = $('#buttonUploadGPXinput');
  $el.wrap('<form>').closest('form').get(0).reset();
  $el.unwrap();
}
