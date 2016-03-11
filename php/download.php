<?php

header('Content-type: application/gpx');
header('Content-Disposition: attachment; filename="markers.gpx"');

echo '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' . "\n";
echo '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns="http://www.topografix.com/GPX/1/1" creator="Flopp\'s Map - http://flopp.net/" xmlns:wptx1="http://www.garmin.com/xmlschemas/WaypointExtension/v1" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd  http://www.garmin.com/xmlschemas/WaypointExtension/v1 http://www.garmin.com/xmlschemas/WaypointExtensionv1.xsd" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3">' . "\n";
echo '  <metadata>' . "\n";
echo '    <name>Export from Flopp\'s Map</name>' . "\n";
echo '  </metadata>' . "\n";

if (isset($_COOKIE['markers']))
{
  $markers = explode(':', $_COOKIE['markers']);
  foreach ($markers as $key => $id)
  {
    $cookieName = 'marker' . $id;
    if (isset($_COOKIE[$cookieName]))
    {
      $data = explode(':', $_COOKIE[$cookieName]);
      if (isset($data[0]) && isset($data[1]) && isset($data[2]) && isset($data[3]))
      {
        $lat = $data[0];
        $lon = $data[1];
        $radius = $data[2];
        $name = $data[3];
        echo '  <wpt lat="' . $lat . '" lon="' . $lon .'">' . "\n";
        echo '    <name>' . $name . '</name>' . "\n";
        echo '    <sym>flag</sym>' . "\n";
        if ($radius > 0 )
        {
          echo '    <extensions>' . "\n";
          echo '      <wptx1:WaypointExtension>' . "\n";
          echo '        <wptx1:Proximity>' . $radius . '</wptx1:Proximity>' . "\n";
          echo '      </wptx1:WaypointExtension>' . "\n";
          echo '    </extensions>' . "\n";
        }
        echo '  </wpt>' . "\n";
      }        
    }
  } 
}

echo '</gpx>' . "\n";

?>
