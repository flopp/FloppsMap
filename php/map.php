<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title data-i18n="app.title">FLOPP'S MAP</title>
    <meta name="description" content="Fullscreen map with coordinates, waypoint projection, distance/bearing calculation, display of geocaches"</meta>

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
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0&amp;language=en"></script>
    <script src="https://apis.google.com/js/client.js"></script>

    <!-- jquery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>

    <!-- js cookie -->
    <script src="js/js.cookie.js"></script>

    <!-- jquery.ajax-cross-origin -->
    <script src="js/jquery.ajax-cross-origin.min.js"></script>

    <!-- geographiclib -->
    <script src="js/geographiclib.js"></script>

    <!-- i18next -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/i18next/3.3.1/i18next.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/i18next-browser-languagedetector/0.3.0/i18nextBrowserLanguageDetector.min.js"></script>
    <script src="js/i18nextXHRBackend.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-i18next/0.0.14/i18next-jquery.min.js"></script>

    <!-- bootstrap + font-awesome -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css" />

    <!-- fonts -->
    <link type="text/css" rel="stylesheet" href="https://fonts.googleapis.com/css?family=Norican">

    <!-- my own stuff -->
    <script type="text/javascript" src="js/compressed.js?t=TSTAMP"></script>
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

<script>
<?php
$cntr = "";
$zoom = "";
$maptype = "";
$markers = "";
$lines = "";
$features = "[default]";
$geocache = "";

if(!empty($_GET))
{
  if(isset($_GET['c'])) { $cntr = $_GET['c']; }
  if(isset($_GET['z'])) { $zoom = $_GET['z']; }
  if(isset($_GET['t'])) { $maptype = $_GET['t']; }
  if(isset($_GET['m'])) { $markers = $_GET['m']; }
  if(isset($_GET['d'])) { $lines = $_GET['d']; }
  if(isset($_GET['f'])) { $features = $_GET['f']; }
  if(isset($_GET['g'])) { $geocache = $_GET['g']; }
}

echo "\$(function() {";
echo "initialize('$cntr', '$zoom', '$maptype', '$features', '$markers', '$lines', '$geocache');";
echo "})";
?>

$(document).ready( function() { init_lang(); });
</script>
</head>

<body>

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
      <a class="navbar-brand" href="#" style="margin-left:32px;"><div style="width: 32px"></div><span data-i18n="nav.title">FLOPP'S MAP</span></a>
    </div>

    <div class="navbar-collapse collapse">
      <ul class="nav navbar-nav">
        <li><a id="navbarBlog" role="button" href="http://blog.flopp-caching.de/" target="_blank"><span data-i18n="nav.blog">BLOG</span> <i class="fa fa-star"></i></a></li>
        <li><a id="navbarHelp" role="button" href="http://blog.flopp-caching.de/benutzung-der-karte/" target="_blank"><span data-i18n="nav.help">HELP</span> <i class="fa fa-question"></i></a></li>
        <li><a id="navbarInfo" role="button" href="javascript:showInfoDialog()"><span data-i18n="nav.impress">IMPRESS</span> <i class="fa fa-info"></i></a></li>
        <li></li>
      </ul>
      <form class="nav navbar-form navbar-right" style="margin:auto">
         <span class="btn btn-default btn-sm navbar-btn" onclick="langEN();" data-i18n="[html]nav.english">ENGLISH</span>
         <span class="btn btn-default btn-sm navbar-btn" onclick="langDE();" data-i18n="[html]nav.german">DEUTSCH</span>
         <span class="btn btn-default btn-sm navbar-btn" onclick="langNL();" data-i18n="[html]nav.dutch">NEDERLANDS</span>
         <span class="btn btn-default btn-sm navbar-btn" onclick="langRO();" data-i18n="[html]nav.romanian">ROMANIAN</span>
         <span class="btn btn-default btn-sm navbar-btn" onclick="langPL();" data-i18n="[html]nav.polish">POLISH</span>
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
  <div class="my-section-header" data-i18n="sidebar.search.title">SEARCH</div>
  <!--<button id="buttonWhereAmI" class="btn btn-info btn-sm my-section-buttons-top" type="button"><i class="fa fa-crosshairs"></i> <span data-i18n="sidebar.search.whereami">WHERE AM I?</span></button>-->

  <div>
    <form action="javascript:Geolocation.search($('#txtSearch').val())">
      <div class="input-group" style="margin-bottom: 5px">
        <input class="form-control" id="txtSearch" type="text" data-i18n="[placeholder]sidebar.search.placeholder;">
        <span class="input-group-btn">
          <button class="btn btn-info" type="submit"><i class="fa fa-search"></i></button>
        </span>
      </div>
    </form>
  </div>
</div> <!-- section -->

<div class="my-section-with-footer my-section">
  <div class="my-section-header" data-i18n="sidebar.markers.title">MARKERS</div>
  <div id="btnmarkers1" class="btn-group btn-group-sm my-section-buttons-top">
    <button id="buttonMarkersNew1" class="btn btn-sm btn-success" type="button" onClick="newMarker(map.getCenter(), -1, -1, null)"><i class="fa fa-map-marker"></i> <span data-i18n="sidebar.markers.new">NEW</span></button>
    <button id="buttonMarkersDeleteAll1" class="btn btn-sm btn-danger" type="button" onClick="theMarkers.deleteAll()"><i class="fa fa-trash-o"></i> <span data-i18n="sidebar.markers.deleteall">DELETE ALL</span></button>
  </div>
  <div id="dynMarkerDiv"></div>
  <div id="btnmarkers2" class="btn-group btn-group-sm my-section-buttons-bottom" style="display: none">
    <button id="buttonMarkersNew2" class="btn btn-sm btn-success" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )"><i class="fa fa-map-marker"></i> <span data-i18n="sidebar.markers.new">NEW</span></button>
    <button id="buttonMarkersDeleteAll2" class="btn btn-sm btn-danger" type="button" onClick="theMarkers.deleteAll()"><i class="fa fa-trash-o"></i> <span data-i18n="sidebar.markers.deleteall">DELETE ALL</span></button>
  </div>
</div> <!-- section -->

<div class="my-section">
  <div class="my-section-header" data-i18n="sidebar.lines.title">LINES</div>
  <div class="btn-group btn-group-sm my-section-buttons-top">
    <button id="buttonLinesNew" class="btn btn-sm btn-success" type="button" onClick="Lines.newLine(-1, -1)"><i class="fa fa-minus"></i> <span data-i18n="sidebar.lines.new">NEW</span></button>
    <button id="buttonLinesDeleteAll" class="btn btn-sm btn-danger" type="button" onClick="Lines.deleteAllLines()"><i class="fa fa-trash-o"></i> <span data-i18n="sidebar.lines.deleteall">DELETE ALL</span></button>
  </div>
  <div id="dynLineDiv"></div>
</div> <!-- section -->

<div class="my-section">
  <div class="my-section-header" data-i18n="sidebar.misc.title">MISC</div>
  <div style="margin-bottom: 10px">
    <button id="buttonMulticoordinates" class="btn btn-block btn-sm btn-success my-new" type="button" data-i18n="sidebar.misc.multicoordinates">MULTICOORDINATES</button>
  </div>
  <div style="margin-bottom: 10px">
    <input id="buttonUploadGPXinput" style="display:none" type="file" name="files" onchange="handleGpxFiles(this.files)">
    <a id="buttonUploadGPX" class="btn btn-block btn-sm btn-success my-new" role="button" data-i18n="sidebar.misc.uploadgpx">UPLOAD GPX</a>
  </div>
  <div style="margin-bottom: 10px">
    <a id="buttonExportGPX" class="btn btn-block btn-sm btn-info" role="button" href="download.php" data-i18n="sidebar.misc.gpx">EXPORT GPX</a>
  </div>
  <div style="margin-bottom: 10px">
    <button id="buttonPermalink" class="btn btn-block btn-sm btn-info" type="button" onClick="generatePermalink()" data-i18n="sidebar.misc.permalink">CREATE PERMALINK</button>
  </div>

  <b data-i18n="sidebar.misc.coordinates">FORMAT OF COORINATES</b>
  <div>
    <select class="form-control" id="coordinatesFormat">
      <option value="DM">DDD MM.MMM</option>
      <option value="DMS">DDD MM SS.SS</option>
      <option value="D">DDD.DDDDD</option>
    </select>
  </div>

  <b data-i18n="sidebar.misc.layers">ADDITIONAL LAYERS</b>
  <div style="margin-bottom: 10px">
    <div class="checkbox">
        <label>
            <input id="hillshading" type="checkbox">
            <span data-i18n="sidebar.misc.hillshading">HILL SHADING</span>
            <!--
            <button class="btn btn-info btn-xs" onClick="showHillshadingDialog()">
                <i class="fa fa-info"></i>
            </button>
            -->
        </label>
    </div>

    <!--<div class="checkbox">
        <label>
            <input id="boundaries" type="checkbox">
            <span data-i18n="sidebar.misc.boundaries">ADMINISTRATIVE BOUNDARIES</span>
            <button class="btn btn-info btn-xs" onClick="showBoundariesDialog()">
                <i class="fa fa-info"></i>
            </button>
        </label>
    </div>-->
    <div class="checkbox">
        <label>
            <input id="npa" type="checkbox">
            <span data-i18n="sidebar.misc.npa">NATURE PROTECTION AREAS</span>
            <button class="btn btn-info btn-xs" onClick="NPA.showDialog();">
                <i class="fa fa-info"></i>
            </button>
        </label>
    </div>
    <div id="npa_details" style="display: none;">
        <button class="btn btn-block btn-sm btn-info" style="margin-bottom: 10px;" onClick="NPA.startInfoMode();" data-i18n="sidebar.misc.npainfo">SHOW NPA INFO ON NEXT CLICK</button>
    </div>
    <div class="checkbox">
        <label>
            <input id="cdda" type="checkbox">
            <span data-i18n="sidebar.misc.cdda">NATIONALLY DESIGNATED AREAS</span>
            <button class="btn btn-info btn-xs" onClick="CDDA.showDialog();">
                <i class="fa fa-info"></i>
            </button>
            <span class="my-new" style="width: 30px; height: 16px; display: inline-block;">&nbsp;</span>
        </label>
    </div>
    <div id="cdda_details" style="display: none;">
        <button class="btn btn-block btn-sm btn-info" style="margin-bottom: 10px;" onClick="CDDA.startInfoMode();" data-i18n="sidebar.misc.cddainfo">SHOW CDDA INFO ON NEXT CLICK</button>
    </div>
    <div class="checkbox">
        <label>
            <input id="freifunk" type="checkbox">
            <span data-i18n="sidebar.misc.freifunk">FREIFUNK</span>
            <button class="btn btn-info btn-xs" onClick="Freifunk.showDialog();">
                <i class="fa fa-info"></i>
            </button>
        </label>
    </div>
    <div id="freifunk_details" style="display: none;">
        <button class="btn btn-block btn-sm btn-info" style="margin-bottom: 10px;" onClick="Freifunk.startInfoMode();" data-i18n="sidebar.misc.freifunkinfo">SHOW FREIFUNK INFO ON NEXT CLICK</button>
    </div>
    <div class="checkbox">
        <label>
            <input id="geocaches" type="checkbox">
            <span data-i18n="[html]sidebar.misc.geocaches">GEOCACHES FROM OPENCACHING</span>
        </label>
    </div>
  </div>

  <b data-i18n="sidebar.misc.external">EXTERNAL SERVICES</b>
  <div>
    <div class="input-group">
      <select class="form-control" id="externallinks"></select>
      <span class="input-group-btn">
        <button class="btn btn-info" type="button" onClick="gotoExternalLink()"><i class="fa fa-play"></i></button>
      </span>
    </div>
  </div>
</div> <!-- section -->

<div style="text-align: center; color: white;">&copy; 2012-2016, <a href="http://www.florian-pigorsch.de/" target="_blank">Florian Pigorsch</a> &amp; contributors</div>

</div> <!-- sidebar -->


<!-- the info dialog -->
<div id="dlgInfoAjax" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h3 data-i18n="dialog.info.title">INFO/IMPRESS</h3>
      </div>
      <div class="modal-body" data-i18n="[html]dialog.info.content">INFO CONTENT</div>
      <div class="modal-footer">
        <button class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

<!-- the alert dialog -->
<div id="dlgAlert" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 id="dlgAlertHeader">TITLE</h3>
      </div>
      <div id="dlgAlertMessage" class="modal-body">CONTENT</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="projectionDialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.projection.title">WAYPOINT PROJECTION</h3>
      </div>
      <div class="modal-body">
        <img src="img/projection.png" style="float: right">
        <div style="margin-right: 150px">
          <p data-i18n="[html]dialog.projection.content">PROJECTION CONTENT</p>
          <form role="form">
            <div class="form-group">
              <label for="projectionBearing" class="control-label" data-i18n="[html]dialog.projection.bearing">BEARING</label>
              <input type="text" class="form-control" id="projectionBearing" data-i18n="[placeholder]dialog.projection.bearing_placeholder">
            </div>
            <div class="form-group">
              <label for="projectionDistance" class="control-label" data-i18n="dialog.projection.distance">DISTANCE</label>
              <input type="text" class="form-control" id="projectionDistance" data-i18n="[placeholder]dialog.projection.distance_placeholder">
            </div>
          </form>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-dismiss="modal" data-i18n="dialog.cancel">CANCEL</button>
      <button id="projectionDialogOk" type="button" class="btn btn-primary" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="linkDialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.permalink.title">PERMALINK</h3>
      </div>
      <div class="modal-body">
        <div data-i18n="[html]dialog.permalink.content">PERMALINK CONTENT</div>
        <div class="input-group">
          <input class="form-control" id="linkDialogLink" type="text">
          <span class="input-group-btn">
            <button id="buttonPermalinkShorten" class="btn btn-info" type="button" onclick="linkDialogShortenLink()" data-i18n="dialog.permalink.shorten">SHORTEN</button>
          </span>
        </div>
        <div id="linkDialogError"></div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>


<div id="multicoordinatesDialog" class="modal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h3 data-i18n="dialog.multicoordinates.title">MULTICOORDINATES</h3>
            </div>
            <div class="modal-body">
                <div data-i18n="[html]dialog.multicoordinates.content">MULTICOORDINATES CONTENT</div>
                <div class="form-group">
                    <label for="multicoordinatesDialogText" class="control-label" data-i18n="[html]dialog.multicoordinates.label_coordinates">COORDINATES</label>
                    <textarea class="form-control" id="multicoordinatesDialogText" rows="10"></textarea>
                </div>
                <div class="form-group">
                  <label for="multicoordinatesPrefix" class="control-label" data-i18n="[html]dialog.multicoordinates.label_prefix">PREFIX</label>
                  <input type="text" class="form-control" id="multicoordinatesPrefix" value="MULTI_">
                </div>
                <div id="multicoordinatesError"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal" data-i18n="dialog.cancel">CANCEL</button>
                <button id="multicoordinatesDialogOk" type="button" class="btn btn-success" data-i18n="dialog.ok">OK</button>
            </div>
        </div>
    </div>
</div>


<!--
<div id="dialogHillshading" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.hillshading.title">HILL SHADING</h3>
      </div>
      <div class="modal-body">
        <div data-i18n="[html]dialog.hillshading.content">HILL SHADING CONTENT</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>
-->

<div id="dialogBoundaries" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.boundaries.title">ADMINISTRATIVE BOUNDRIES</h3>
      </div>
      <div class="modal-body">
        <div data-i18n="[html]dialog.boundaries.content">BOUNDARIES CONTENT</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="dialogNPA" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.npa.title">NATURE PROTECTION AREAS</h3>
      </div>
      <div class="modal-body">
        <div data-i18n="[html]dialog.npa.content">NPA CONTENT</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="dialogCDDA" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.cdda.title">NATIONALLY DESIGNATED AREAS</h3>
      </div>
      <div class="modal-body">
        <div data-i18n="[html]dialog.cdda.content">CDDA CONTENT</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

<div id="dialogFreifunk" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 data-i18n="dialog.freifunk.title">FREIFUNK</h3>
      </div>
      <div class="modal-body">
        <div data-i18n="[html]dialog.freifunk.content">FREIFUNK CONTENT</div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal" data-i18n="dialog.ok">OK</button>
      </div>
    </div>
  </div>
</div>

  </body>
</html>
