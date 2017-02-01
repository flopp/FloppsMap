/*jslint
  regexp: true
  indent: 4
*/

/*global
  $,
  document, encodeURIComponent,
  Markers
*/

var DownloadGPX = {};
DownloadGPX.m_map = null;


DownloadGPX.init = function (themap) {
    'use strict';

    DownloadGPX.m_map = themap;
};


DownloadGPX.initiateDownload = function () {
    'use strict';

    var data = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n';
    data += '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns="http://www.topografix.com/GPX/1/1" creator="Flopp\'s Map - http://flopp.net/" xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd  http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www.garmin.com/xmlschemas/WaypointExtensionv1.xsd" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">\n';
    data += '    <metadata>\n';
    data += '        <name>Export from Flopp\'s Map</name>\n';
    data += '    </metadata>\n';
    data += Markers.toXmlWpts();
    data += '</gpx>\n';
    console.log(data);
    var element = document.createElement('a');
    element.setAttribute('href', 'data:application/gpx+xml;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', 'markers.gpx');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};
