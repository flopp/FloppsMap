/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, _paq, document
*/


function trackMarker(action) {
    'use strict';

    _paq.push(['setCustomVariable', 2, 'markers', action, 'page']);
    _paq.push(['trackPageView']);
}


function trackLine(action) {
    'use strict';

    _paq.push(['setCustomVariable', 3, 'lines', action, 'page']);
    _paq.push(['trackPageView']);
}


function trackAction(action) {
    'use strict';

    _paq.push(['setCustomVariable', 1, 'general', action, 'page']);
    _paq.push(['trackPageView']);
}


function trackSearch(query) {
    'use strict';

    _paq.push(['trackSiteSearch', query, false, false]);
}

$(document).ready(function () {
    'use strict';

    $("#navbarBlog").click(function () { trackAction("navbar.blog"); });
    $("#navbarHelp").click(function () { trackAction("navbar.help"); });
    $("#navbarInfo").click(function () { trackAction("navbar.info"); });

    //$("#buttonWhereAmI").click(function () { trackSearch("whereami"); });

    $("#buttonExportGPX").click(function () { trackAction("export.gpx"); });

    $("#buttonPermalink").click(function () { trackAction("permalink.create"); });
    $("#buttonPermalinkShorten").click(function () { trackAction("permalink.shorten"); });

    $("#buttonMarkersNew1").click(function () { trackMarker("new1"); });
    $("#buttonMarkersDeleteAll1").click(function () { trackMarker("deleteall1"); });
    $("#buttonMarkersNew2").click(function () { trackMarker("new2"); });
    $("#buttonMarkersDeleteAll2").click(function () { trackMarker("deleteall2"); });

    $("#buttonLinesNew").click(function () { trackLine("new"); });
    $("#buttonLinesDeleteAll").click(function () { trackLine("deleteall"); });

    $("#sidebartoggle").click(function () { trackAction("sidebar.toggle"); });
    $("#hillshading").click(function () { trackAction("hillshading.toggle"); });
    $("#npa").click(function () { trackAction("npa.toggle"); });
    $("#boundaries").click(function () { trackAction("boundaries.toggle"); });
    $("#geocaches").click(function () { trackAction("geocaches.toggle"); });
});
