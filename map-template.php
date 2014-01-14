<?php
require_once('lib/lang.php');
?>
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title><?php TT('Flopp\'s Map', 'Flopps Tolle Karte');?></title>
    <meta name="description" content="<?php TT('Fullscreen map with coordinates, waypoint projection, distance/bearing calculation, display of geocaches', 'Vollbild-Karte mit Koordinaten, Wegpunktprojektion, Berechnung von Entfernungen und Winkeln, Anzeige von Geocaches');?>"</meta>
    
    <meta name="viewport" content="height = device-height,
    width = device-width,
    initial-scale = 1.0,
    minimum-scale = 1.0,
    maximum-scale = 1.0,
    user-scalable = no,
    target-densitydpi = device-dpi" />
  
    <link rel="author" href="https://plus.google.com/100782631618812527586" />
    <link rel="icon" href="img/favicon.png" type="image/png" />
    <link rel="shortcut icon" href="img/favicon.png" type="image/png" />
    <link rel="image_src" href="img/screenshot.png" />
    
    <!-- google maps -->
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0&amp;sensor=true&amp;language=<?php TT('en', 'de');?>"></script>
    <script src="https://apis.google.com/js/client.js"></script>

    <!-- jquery -->
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    
    <!-- jquery.cookie -->
    <script src="ext/jquery-cookie/jquery.cookie.js"></script>

    <!-- bootstrap + font-awesome -->
    <link rel="stylesheet"  href="//netdna.bootstrapcdn.com/bootstrap/3.0.3/css/bootstrap.min.css" />
    <script src="//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.min.css" />
 
    <!-- fonts --> 
    <link type="text/css" rel="stylesheet" href="//fonts.googleapis.com/css?family=Norican">
    
    <!-- my own stuff -->
    <script type="text/javascript" src="js/conversion.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/cookies.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/geographiclib.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/coordinates.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/map.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/okapi.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/tracking.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/ui.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/user.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/lang.js?t=TSTAMP"></script>    
    <link type="text/css" rel="stylesheet" href="css/main.css?t=TSTAMP">
    
<!-- Piwik -->
<script type="text/javascript"> 
  var _paq = _paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u=(("https:" == document.location.protocol) ? "https" : "http") + "://flopp-caching.de/piwik//";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', 1]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript';
    g.defer=true; g.async=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Piwik Code -->

</head>
  
<?php
$cntr = "";
$zoom = "";
$maptype = "";
$markers = "";
$lines = "";

if(!empty($_GET)) 
{
  // center: c=LAT:LON or c=DEG or c=DMMM or ...
  if(isset($_GET['c'])) 
  {
    $cntr = $_GET['c'];
  }
  if(isset($_GET['z'])) 
  {
    $zoom = $_GET['z'];
  }
  if(isset($_GET['t']))
  {
    $maptype = $_GET['t'];
  }    
  if(isset($_GET['m']))
  {
    $markers = $_GET['m'];
  }
  if(isset($_GET['d']))
  {
    $lines = $_GET['d'];
  }
}

echo "<body onload=\"initialize('$lang', '$cntr', '$zoom', '$maptype', '$markers', '$lines')\">";
?>


<!-- the menu -->
<div class="navbar navbar-custom navbar-static-top">
  <div class="navbar-inner">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <img src="img/favicon.png" style="position: absolute; top: 9px; left:4px;">
      <a class="navbar-brand" href="#" style="margin-left:32px;"><div style="width: 32px"></div><?php TT('Flopp\'s Map', 'Flopps Tolle Karte');?></a>
    </div>
        
    <div class="navbar-collapse collapse">
      <ul class="nav navbar-nav">
        <li><a id="navbarBlog" role="button" href="http://blog.flopp-caching.de/" target="_blank" rel="tooltip" title="<?php TT('Go to \'Flopps Tolles Blog\'', 'Hier geht es zu \'Flopps Tolles Blog\'');?>">Blog <i class="fa fa-star"></i></a></li>
        <li><a id="navbarHelp" role="button" href="http://blog.flopp-caching.de/benutzung-der-karte/" target="_blank" rel="tooltip" title="<?php TT('Go to the online help', 'Hier geht es zu den Hilfeseiten');?>"><?php TT('Help (in German)', 'Hilfe');?> <i class="fa fa-question"></i></a></li>
        <li><a id="navbarInfo" role="button" href="javascript:showInfoDialog()" rel="tooltip" title="<?php TT('Legal information, contact information, ...', 'Rechtliche Hinweise, Kontaktinformationen, usw.');?>"><?php TT('Info/Impress', 'Info/Impressum');?> <i class="fa fa-info"></i></a></li>
        <li></li>
      </ul>
      <form class="nav navbar-form navbar-right" style="margin:auto">
         <span class="btn btn-default btn-sm navbar-btn" onclick="langEN();"><?php TT('English <i class="fa fa-check"></i>', 'English');?></span>
         <span class="btn btn-default btn-sm navbar-btn" onclick="langDE();"><?php TT('Deutsch', 'Deutsch <i class="fa fa-check"></i>');?></span>
      </form>
    </div>
  </div>
</div>

<!-- the map -->
<div id="map-wrapper">
  <div id="themap"></div>
</div>
  

<a id="sidebartoggle" href="javascript:">
  <span id="sidebartogglebutton"><i class="fa fa-chevron-right"></i></span>
</a>

<div id="sidebar">

<div class="my-section">
  <div class="my-section-header"><?php TT('Search', 'Suche');?></div>
  <button id="buttonWhereAmI" class="btn btn-info btn-sm my-section-buttons-top" title="<?php TT('Move map to current location', 'Bewege die Karte zum aktuellen Aufenthaltsort');?>" type="button" onClick="geolocation.whereAmI()"><i class="fa fa-crosshairs"></i> <?php TT('Where am I?', 'Wo bin ich?');?></button>
    
  <div>
    <form action="javascript:geolocation.search($('#txtSearch').val())">
      <div class="input-group" style="margin-bottom: 5px">
        <input class="form-control" id="txtSearch" type="text" placeholder="<?php TT('Coordinates or place', 'Koordinaten oder Ort');?>" title="<?php TT('Search for coordinates or a place and center the map on the result', 'Suche nach Koordinaten oder einem Ort und zentriere die Karte auf dem Suchergebnis');?>">
        <span class="input-group-btn">
          <button class="btn btn-info" type="submit" title="<?php TT('Search for coordinates or a place and center the map on the result', 'Suche nach Koordinaten oder einem Ort und zentriere die Karte auf dem Suchergebnis');?>"><i class="fa fa-search"></i></button>
        </span>
      </div>
    </form>
  </div>
</div> <!-- section -->

<div class="my-section">
  <div class="my-section-header"><?php TT('Save/Load', 'Speichern/Laden');?></div>
  <div id="loginForm">
    <input id="loginLogin" type="text" class="form-control" placeholder="<?php TT('Username', 'Benutzer'); ?>">
    <input id="loginPassword" type="password" class="form-control" placeholder="<?php TT('Password', 'Passwort'); ?>">
    <button class="btn btn-sm" onclick="user.login($('#loginLogin').val(), $('#loginPassord').val());"><?php TT('Login', 'Einloggen'); ?></button>
    <!--<a href=""><?php TT('Create new account', 'Neues Konto anlegen.'); ?></a>-->
  </div>
  <div id="loggedInForm">
    <span id="loggedInMessage">Hallo Flopp!</span>
    <div>
      <button class="btn btn-sm" onclick="user.logout()"><?php TT('Logout', 'Ausloggen'); ?></button>
    </div>
    
    <b><?php TT('Collections', 'Sammlungen'); ?></b>
    <select id="loggedInCollections" class="form-control">
      <option><?php TT('[New Collection]', '[Neue Sammlung]'); ?></option>
    </select>
    <button class="btn btn-sm" onclick="user.saveCollection();"><?php TT('Save', 'Speichern'); ?></button>
    <button class="btn btn-sm" onclick="user.loadCollection();"><?php TT('Load', 'Laden'); ?></button>
    <button class="btn btn-sm" onclick="user.renameCollection();"><?php TT('Rename', 'Umbenennen'); ?></button>
    <button class="btn btn-sm" onclick="user.deleteCollection();"><?php TT('Delete', 'Löschen'); ?></button>
  </div>
  <!--
  <div>
    <select class="form-control">
      <option><?php TT('[New Collection]', '[Neue Sammlung]'); ?></option>
    </select>
      <button class="btn btn-sm"><?php TT('Save', 'Speichern'); ?></button>
      <button class="btn btn-sm"><?php TT('Load', 'Laden'); ?></button>
      <button class="btn btn-sm"><?php TT('Rename', 'Umbenennen'); ?></button>
      <button class="btn btn-sm"><?php TT('Delete', 'Löschen'); ?></button>
  </div>
  -->
</div>

<div class="my-section-with-footer my-section">
  <div class="my-section-header"><?php TT('Markers', 'Marker');?></div>
  <div id="btnmarkers1" class="btn-group btn-group-sm my-section-buttons-top">
    <button id="buttonMarkersNew1" class="btn btn-sm btn-success" title="<?php TT('Create a new marker at the current map position', 'Erzeuge einen Marker an der aktuellen Position');?>" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )"><i class="fa fa-map-marker"></i> <?php TT('New', 'Neu');?></button>
    <button id="buttonMarkersDeleteAll1" class="btn btn-sm btn-danger" title="<?php TT('Delete all markers', 'Lösche alle Marker');?>" type="button" onClick="deleteAllMarkers()"><i class="fa fa-trash-o"></i> <?php TT('Delete all', 'Alle löschen');?></button>
  </div>
  <div id="dynMarkerDiv"></div>
  <div id="btnmarkers2" class="btn-group btn-group-sm my-section-buttons-bottom" style="display: none">
    <button id="buttonMarkersNew2" class="btn btn-sm btn-success" title="<?php TT('Create a new marker at the current map position', 'Erzeuge einen Marker an der aktuellen Position');?>" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )"><i class="fa fa-map-marker"></i> <?php TT('New', 'Neu');?></button>
    <button id="buttonMarkersDeleteAll2" class="btn btn-sm btn-danger" title="<?php TT('Delete all markers', 'Lösche alle Marker');?>" type="button" onClick="deleteAllMarkers()"><i class="fa fa-trash-o"></i> <?php TT('Delete all', 'Alle löschen');?></button>
  </div>
</div> <!-- section -->
  
<div class="my-section">
  <div class="my-section-header"><?php TT('Lines', 'Linien');?></div>
  <div class="btn-group btn-group-sm my-section-buttons-top">
    <button id="buttonLinesNew" class="btn btn-sm btn-success" title="<?php TT('Create a new line', 'Erzeuge eine neue Linie');?>" type="button" onClick="newLine()"><i class="fa fa-minus"></i> <?php TT('New', 'Neu');?></button>
    <button id="buttonLinesDeleteAll" class="btn btn-sm btn-danger" title="<?php TT('Delete all lines', 'Lösche alle Linien');?>" type="button" onClick="deleteAllLines()"><i class="fa fa-trash-o"></i>  <?php TT('Delete all', 'Alle löschen');?></button>
  </div>
  <div id="dynLineDiv"></div>
</div> <!-- section -->

<div class="my-section">
  <div class="my-section-header"><?php TT('Misc', 'Verschiedenes');?></div>
  <div style="margin-bottom: 10px">
    <a id="buttonExportGPX" class="btn btn-block btn-sm btn-info" title="<?php TT('Export markers as GPX file', 'Exportiere Marker als GPX-Datei');?>" role="button" href="download.php"><?php TT('Export GPX (&beta;eta)', 'GPX-Export (&beta;eta)');?></a>
  </div>
  <div style="margin-bottom: 10px">
    <button id="buttonPermalink" class="btn btn-block btn-sm btn-info" title="<?php TT('Create permalink', 'Erzeuge Permalink');?>" type="button" onClick="generatePermalink()"><?php TT('Create permalink', 'Erzeuge Permalink');?></button>
  </div>

<b><?php TT('Additional Layers', 'Zusätzliche Ebenen');?></b>
<div style="margin-bottom: 10px">
  <label class="checkbox" title="<?php TT('Toggle hillshading', 'Aktiviere Hillshading');?>">
    <input id="hillshading" type="checkbox"> <?php TT('Hillshading', 'Hillshading');?>
  </label>
  <label class="checkbox" title="<?php TT('Toggle administrative boundaries', 'Aktiviere Kreisgrenzen');?>">
    <input id="showKreisgrenzen" type="checkbox"> <?php TT('Show administrative boundaries (Germany)', 'Zeige Kreisgrenzen');?> 
  </label>
</div>

<b><?php TT('Geocaches (<a href="http://www.opencaching.eu/">Opencaching</a>)', 'Geocaches (<a href="http://www.opencaching.eu/">Opencaching</a>)');?></b>
<div style="margin-bottom: 10px">
  <label class="checkbox" title="<?php TT('Show geocaches on the map', 'Geocaches auf der Karte anzeigen');?>">
    <input id="showCaches" type="checkbox"> <?php TT('Show geocaches', 'Zeige Geocaches');?>
  </label>
</div>

<b><?php TT('External Services', 'Externe Dienste');?></b>
<div>
  <div class="input-group">
    <select class="form-control" id="externallinks" title="<?php TT('Open external service', 'Öffne externen Dienst');?>"></select>
    <span class="input-group-btn">
      <button class="btn btn-info" type="button" onClick="gotoExternalLink()" title="<?php TT('Open external service', 'Öffne externen Dienst');?>"><i class="fa fa-play"></i></button>
    </span>
  </div>
</div>
    </div>
</div> <!-- section -->

</div> <!-- sidebar -->


<!-- the info dialog -->
<div id="dlgInfoAjax" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h3><?php TT('Info/Impress', 'Info/Impressum');?></h3>
      </div>
      <div class="modal-body">
<?php 
require('lang/info.' . $lang . '.html')
?>    
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" data-dismiss="modal">Ok</button>
      </div>
    </div>
  </div>
</div>

<!-- the alert dialog -->
<div id="dlgAlert" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="dlgAlertHeader">Modal header</h3>
      </div>
      <div id="dlgAlertMessage" class="modal-body">Modal body</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="projectionDialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3><?php TT('Waypoint Projection', 'Wegpunktprokjektion');?></h3>
      </div>
      <div class="modal-body">
   
<img src="img/projection.png" style="float: right">
<div  style="margin-right: 150px">
<p><?php TT('Waypoint projection creates a new marker <b>d</b> meters away from the source marker with a bearing angle of <b>&beta;°</b>,', 'Wegpunktprojektion erzeugt einen neuen Marker, der <b>d</b> Meter vom Ursprungsmarker entfernt ist und unter einem Winkel von <b>&beta;°</b> erscheint.');?></p>
<form role="form">
  <div class="form-group">
    <label for="projectionBearing" class="control-label"><?php TT('Bearing &beta;', 'Winkel &beta;');?></label>
    <input type="text" class="form-control" id="projectionBearing" placeholder="<?php TT('Bearing angle in °; 0-360', 'Winkel &beta; in °; 0-360');?>">
  </div>
  <div class="form-group">
    <label for="projectionDistance" class="control-label"><?php TT('Distance d', 'Entfernung d');?></label>
    <input type="text" class="form-control" id="projectionDistance" placeholder="<?php TT('Projection distance in meters', 'Projektionsdistanz in Metern');?>">
  </div>
</form>
</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-dismiss="modal"><?php TT('Cancel', 'Abbruch');?></button>
      <button id="projectionDialogOk" type="button" class="btn btn-primary">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="linkDialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3><?php TT('Permalink', 'Permalink');?></h3>
      </div>
      <div class="modal-body">
        <div>
          <?php TT('The following URL links to the current view of Flopp\'s Map including all markers, lines and the selected map type. Copy (<tt>CTRL+C</tt>) the URL and share it with your friends!', 'Die folgende URL beschreibt die aktuelle Kartenansicht inklusive aller Marker, Linien und des ausgewählten Kartentyps. Kopiere (<tt>STRG+C</tt>) die URL und teile sie mit deinen Freunden!');?>
          <br />
          <?php TT('<b>Shorten</b> runs the long URL through an URL shortener (<a href="http://goo.gl/" target="_blank">goo.gl</a>) an produces a shortened URL.', '<b>Kürzen</b> schickt die lange URL durch einen URL-Shortener (<a href="http://goo.gl/" target="_blank">goo.gl</a>) und erzeugt so einen kürzere URL.');?>
        </div>
        <div class="input-group">
          <input class="form-control" id="linkDialogLink" type="text" title="<?php TT('Permalink to the current map view', 'Permalink für die aktuelle Kartenansicht');?>">
          <span class="input-group-btn">
            <button id="buttonPermalinkShorten" class="btn btn-info" type="button" title="<?php TT('Shorten the permalink', 'Verkürze den Permalink');?>" onclick="linkDialogShortenLink()"><?php TT('Shorten', 'Kürzen');?></button>
          </span>
        </div>
        <div id="linkDialogError"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">OK</button>
      </div>
    </div>
  </div>
</div>

  </body>
</html>
