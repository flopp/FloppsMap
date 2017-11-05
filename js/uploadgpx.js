/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, google, FileReader, DOMParser,
  Markers, showAlert, mytrans
*/


function parseWpt(wpt, default_name) {
    'use strict';

    var el, i,
        name = '',
        radius = 0;

    el = wpt.getElementsByTagName('name');
    if (el.length > 0) {
        name = el[0].textContent;
    }
    name = name.replace(/[^A-Za-z0-9_\-]/gi, '');
    if (name === '') {
        name = default_name;
    }

    el = wpt.getElementsByTagName('*');
    for (i = 0; i < el.length; i = i + 1) {
        if (el[i].tagName === 'wptx1:Proximity') {
            radius = parseInt(el[i].textContent, 10);
            break;
        }
    }

    return {
        name: name,
        coords: new google.maps.LatLng(wpt.getAttribute('lat'), wpt.getAttribute('lon')),
        radius: radius
    };
}


function handleGpxFiles(files) {
    'use strict';

    if (!files || !files.length) {
        showAlert(
            mytrans("uploadgpx.error"),
            mytrans("uploadgpx.error_no_files")
        );
        return;
    }

    var reader = new FileReader(),
        parser = new DOMParser();

    reader.readAsText(files[0]);
    reader.onloadend = function () {
        var xml = parser.parseFromString(reader.result, "text/xml"),
            wpts,
            wpt,
            i;
        if (!xml) {
            showAlert(
                mytrans("uploadgpx.error"),
                mytrans("uploadgpx.error_bad_xml")
            );
            return;
        }

        wpts = xml.getElementsByTagName('wpt');
        for (i = 0; i < wpts.length; i = i + 1) {
            wpt = parseWpt(wpts[i], 'wpt_' + i);
            if (!Markers.newMarker(wpt.coords, -1, wpt.radius, wpt.name)) {
                showAlert(
                    mytrans("uploadgpx.error"),
                    mytrans("uploadgpx.error_failed_after").replace(/%1/, i)
                );
                return;
            }
        }

        showAlert(
            mytrans("uploadgpx.info"),
            mytrans("uploadgpx.msg_created_markers").replace(/%1/, wpts.length)
        );

        // TODO pan to center of imported markers, adjust zoom
    };

    // reset file input
    $('#buttonUploadGPXinput').wrap('<form>').closest('form').get(0).reset();
    $('#buttonUploadGPXinput').unwrap();
}
