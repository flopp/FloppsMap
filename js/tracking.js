/*jslint
  nomen: true
  indent: 4
*/

/*global
  $, _paq, document
*/


function trackMarker(action) {
    'use strict';

    _paq.push(['trackEvent', 'markers', action]);
}


function trackLine(action) {
    'use strict';

    _paq.push(['trackEvent', 'lines', action]);
}


function trackAction(action) {
    'use strict';

    _paq.push(['trackEvent', 'general', action]);
}


function trackSearch(query) {
    'use strict';

    _paq.push(['trackSiteSearch', query, false, false]);
}

$(document).ready(function () {
    'use strict';

    $("#navbarBlog").click(function () {
        trackAction("navbar.blog");
    });
    $("#navbarHelp").click(function () {
        trackAction("navbar.help");
    });
    $("#navbarInfo").click(function () {
        trackAction("navbar.info");
    });

    $("#buttonExportGPX").click(function () {
        trackAction("export.gpx");
    });

    $("#buttonPermalink").click(function () {
        trackAction("permalink.create");
    });
    $("#buttonPermalinkShorten").click(function () {
        trackAction("permalink.shorten");
    });

    $("#buttonMarkersNew1").click(function () {
        trackMarker("new1");
    });
    $("#buttonMarkersDeleteAll1").click(function () {
        trackMarker("deleteall1");
    });
    $("#buttonMarkersNew2").click(function () {
        trackMarker("new2");
    });
    $("#buttonMarkersDeleteAll2").click(function () {
        trackMarker("deleteall2");
    });

    $("#buttonLinesNew").click(function () {
        trackLine("new");
    });
    $("#buttonLinesDeleteAll").click(function () {
        trackLine("deleteall");
    });

    $("#sidebartoggle").click(function () {
        trackAction("sidebar.toggle");
    });
    $("#hillshading").click(function () {
        trackAction("hillshading.toggle");
    });
    $("#npa").click(function () {
        trackAction("cdda.toggle");
    });
    $("#npa").click(function () {
        trackAction("npa.toggle");
    });
    $("#geocaches").click(function () {
        trackAction("geocaches.toggle");
    });
});
