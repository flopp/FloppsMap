/*jslint
  indent: 4
*/

/*global
  $,
  document, encodeURIComponent,
  Markers, Persist
*/

var DownloadGPX = {};
DownloadGPX.m_map = null;
DownloadGPX.m_symbol = 'flag';


DownloadGPX.init = function (themap) {
    'use strict';

    DownloadGPX.m_map = themap;
    DownloadGPX.m_symbol = Persist.getValue('gpxsymbol', 'flag');
    $("#gpxSymbol").val(DownloadGPX.m_symbol);

    $("#gpxSymbol").change(function () {
        DownloadGPX.m_symbol = $("#gpxSymbol").val();
        Persist.setValue('gpxsymbol', DownloadGPX.m_symbol);
    });
};


DownloadGPX.initiateDownload = function () {
    'use strict';

    var element = document.createElement('a'),
        data = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n' +
                '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns="http://www.topografix.com/GPX/1/1" creator="Flopp\'s Map - http://flopp.net/" xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd  http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www.garmin.com/xmlschemas/WaypointExtensionv1.xsd" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">\n' +
                '    <metadata>\n' +
                '        <name>Export from Flopp\'s Map</name>\n' +
                '    </metadata>\n' +
                Markers.toXmlWpts(DownloadGPX.m_symbol) +
                '</gpx>\n';
    element.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', 'markers.gpx');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
