<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="description" content="Fullscreen map with coordinates, waypoint projection, distance/bearing calculation, display of geocaches" />
    <meta name="viewport" content="height = device-height,
    width = device-width,
    initial-scale = 1.0,
    minimum-scale = 1.0,
    maximum-scale = 1.0,
    user-scalable = no,
    target-densitydpi = device-dpi" />
    <title>Flopp's Map</title>
    <link rel="author" href="https://plus.google.com/100782631618812527586" />
    <link rel="icon" href="img/favicon.png" type="image/png" />
    <link rel="shortcut icon" href="img/favicon.png" type="image/png" />
    <link rel="image_src" href="img/screenshot.png" />
    
    <!-- google maps -->
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0&amp;sensor=true"></script>
    <script src="https://apis.google.com/js/client.js"></script>

    <!-- my own stuff -->
    <script type="text/javascript" src="js/conversion.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/cookies.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/geographiclib.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/coordinates.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/map.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/okapi.js?t=TSTAMP"></script>
    <link type="text/css" rel="stylesheet" href="css/main.css?t=TSTAMP">

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

echo "<body onload=\"initialize( '$cntr', '$zoom', '$maptype', '$markers', '$lines' )\">";
?>


<!-- the menu -->
<div class="navbar navbar-inverse navbar-static-top">
    <div class="navbar-inner">
      <div class="navbar-header">
          <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">Flopp's Map</a>
        </div>
        
        <div class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <li><a role="button" href="http://blog.flopp-caching.de/" rel="tooltip" title="Hier geht es zu 'Flopps Tolles Blog'">Blog <i class="fa fa-star"></i></a></li>
                <li><a role="button" href="http://blog.flopp-caching.de/benutzung-der-karte/" rel="tooltip" title="Hier geht es zu den Hilfeseiten">Hilfe <i class="fa fa-question"></i></a></li>
                <li><a role="button" href="javascript:showDlgInfoAjax()" rel="tooltip" title="Rechtliche Hinweise, Kontaktinformationen, usw.">Info/Impressum <i class="fa fa-info"></i></a></li>
            </ul>
        </div>
    </div>
</div>

<script type="text/javascript">
  function hideSidebar()
  {
    $.cookie("sidebar", "hidden", {expires: 30});
    $('#sidebar').hide();
    $('#sidebartoggle').css( "right", "0px" );
    $('#sidebartogglebutton').html( "<i class=\"fa fa-chevron-left\"></i>" );
    $('#map-wrapper').css("right", "0px");
    google.maps.event.trigger(map, "resize");
  }

  function showSidebar()
  {
    $.cookie("sidebar", "shown", {expires: 30});
    $('#sidebar').show();
    $('#sidebartoggle').css( "right", "264px" );
    $('#sidebartogglebutton').html( "<i class=\"fa fa-chevron-right\"></i>" );
    $('#map-wrapper').css("right", "264px");
    google.maps.event.trigger(map, "resize");
  }
  
  function toggleSidebar(shown)
  {
    if (shown) showSidebar();
    else       hideSidebar();
  } 
  
  function restoreSidebar()
  {
    var state = get_cookie_string("sidebar", "shown");
    toggleSidebar(state != "hidden");
  }
  
  $(document).ready(function() {
    $("#sidebartoggle").click(function() { if ($('#sidebar').is(':visible')) hideSidebar(); else showSidebar(); });      
    $("#hillshading").click(function() { toggleHillshadingLayer($('#hillshading').is(':checked')); });        
    $("#showKreisgrenzen").click(function() { toggleBoundaryLayer($('#showKreisgrenzen').is(':checked')); });
    $("#showCaches").click(function() { okapi_toggle_load_caches($('#showCaches').is(':checked')); });
/*        
    $("#showNSG").click(function() { showNSGLayer( $('#showNSG').is(':checked') ); });
*/        
  });
</script>


<!-- the map -->
<div id="map-wrapper">
    <div id="themap"></div>
</div>
  

<a id="sidebartoggle" href="javascript:">
<span id="sidebartogglebutton"><i class="fa fa-chevron-right"></i></span>
</a>


<div id="sidebar">

<div class="my-section">
  <div class="my-section-header">Search</div>
  <button class="btn btn-info btn-sm my-section-buttons-top" title="Move map to current location" type="button" onClick="whereAmI()"><i class="fa fa-crosshairs"></i> Where am I?</button>
    
    <div>

<form action="javascript:searchLocation()">
<div class="input-group" style="margin-bottom: 5px">
  <input class="form-control" id="txtSearch" type="text" placeholder="Coordinates or place" title="Search for coordinates or a place and center the map on the result">
  <span class="input-group-btn">
    <button class="btn btn-info" type="submit" title="Search for coordinates or a place and center the map on the result"><i class="fa fa-search"></i></button>
  </span>
</div>
</form>

    </div>
</div> <!-- section -->

<div class="my-section-with-footer my-section">
  <div class="my-section-header">Markers</div>
  <div id="btnmarkers1" class="btn-group btn-group-sm my-section-buttons-top">
    <button class="btn btn-sm btn-success" title="Create a new marker at the current map position" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )"><i class="fa fa-map-marker"></i> New</button>
    <button id="btnmarkersdelete1" class="btn btn-sm btn-danger" title="Delete all markers" type="button" onClick="deleteAllMarkers()"><i class="fa fa-trash-o"></i> Delete all</button>
  </div>
  <div id="dynMarkerDiv"></div>
  <div id="btnmarkers2" class="btn-group btn-group-sm my-section-buttons-bottom" style="display: none">
    <button class="btn btn-sm btn-success" title="Create a new marker at the current map position" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )"><i class="fa fa-map-marker"></i> New</button>
    <button id="btnmarkersdelete2" class="btn btn-sm btn-danger" title="Delete all markers" type="button" onClick="deleteAllMarkers()"><i class="fa fa-trash-o"></i> Delete all</button>
  </div>
</div> <!-- section -->
  
<div class="my-section">
  <div class="my-section-header">Lines</div>
  <div class="btn-group btn-group-sm my-section-buttons-top">
    <button class="btn btn-sm btn-success" title="Create new line" type="button" onClick="newLine()"><i class="fa fa-minus"></i> New</button>
    <button class="btn btn-sm btn-danger" title="Delete all lines" type="button" onClick="deleteAllLines()"><i class="fa fa-trash-o"></i> Delete all</button>
  </div>
  <div id="dynLineDiv"></div>
</div> <!-- section -->

<div class="my-section">
  <div class="my-section-header">Misc</div>
  <div style="margin-bottom: 10px">
    <button class="btn btn-sm btn-info" title="Generate permalink" type="button" onClick="generatePermalink()">Create Permalink</button>
  </div>

<b>Additional Layers</b>
<div style="margin-bottom: 10px">
<!--
<label class="checkbox" title="Deutsche Naturschutzgebiete in der Karte markieren">
    <input id="showNSG" type="checkbox"> Zeige Naturschutzgebiete
</label>
-->
  <label class="checkbox" title="Toggle hillshading">
    <input id="hillshading" type="checkbox"> Hillshading
  </label>
  <label class="checkbox" title="Toggle administrative boundaries">
    <input id="showKreisgrenzen" type="checkbox"> Show administrative boundaries
  </label>
</div>

<b>Geocaches (<a href="http://www.opencaching.eu/">Opencaching</a>)</b>
<div style="margin-bottom: 10px">
  <label class="checkbox" title="Geocaches auf der Karte anzeigen">
    <input id="showCaches" type="checkbox"> Show geocaches
  </label>
</div>

<b>External Services</b>
<div>
  <div class="input-group" title="Externer Link">
    <select class="form-control" id="externallinks" title="Open external service"></select>
    <span class="input-group-btn">
      <button class="btn btn-info" type="button" onClick="gotoExternalLink()" title="Open external service"><i class="fa fa-play"></i></button>
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
    <h3>Kontakt/Info</h3>
  </div>
  <div class="modal-body">
    <img class="img-polaroid" width="100ps" height="100px" style="float: right" src="avatar.jpg" alt="Flopp">
    <h4>Kontakt</h4>
    <p>Neuigkeiten und aktuelle Informationen werden über das <a href="http://blog.flopp-caching.de/" alt="Blog">zugehörige Blog <i class="fa fa-globe"></i></a> verbreitet.</p>
    <p>Fragen und Anregungen nehme ich gerne per <a href="mailto:mail@flopp-caching.de" target="_blank">Mail <i class="fa fa-envelope"></i></a> oder <a href="https://twitter.com/floppgc" target="_blank">Twitter <i class="fa fa-twitter-square"></i></a> entgegen. Außerdem gibt es Seiten bei <a href="https://plus.google.com/u/0/116067328889875491676" target="_blank">Google+ <i class="fa fa-google-plus-square"></i></a> und bei <a href="https://www.facebook.com/FloppsTolleKarte" target="_blank">Facebook <i class="fa fa-facebook-square"></i></a>.</p>
    <p>Bugs können auch via <a href="https://github.com/flopp/FloppsTolleKarte" target="_blank">github <i class="fa fa-github-square"></i></a> gemeldet werden.</p>
    <p>Flopps Tolle Karte ist unter den URLs <a href="http://flopp-caching.de/">flopp-caching.de</a>, <a href="http://flopp.net/">flopp.net</a> und <a href="http://foomap.de/">foomap.de</a> erreichbar.</p>
    
    <hr />
    <h4>Impressum</h4>
    <p>Dies ist ein rein privates, werbe- und kostenfreies Informationsangebot
zum Hobby Geocaching. Als nicht geschäftsmäßiges Angebot unterliegt diese
Seite gemäß Telemediengesetz nicht der Impressumspflicht.</p>

    <hr />
    <h4>Hinter den Kulissen...</h4>
    <p>
        <b>Flopps Tolle Karte</b> benutzt <a href="https://developers.google.com/maps/" target="_blank">Google Maps</a>, <a href="http://openstreetmap.org/" target="_blank">OpenStreetMap</a>, <a href="http://opencyclemap.org/" target="_blank">OpenCycleMap</a> und <a href="http://mapquest.com/" target="_blank">MapQuest</a> als Kartenlieferanten, 
        <a href="http://getbootstrap.com/" target="_blank">Bootstrap</a> 
        und <a href="http://jquery.com/" target="_blank">jQuery</a> für die Elemente des Userinterfaces,
        die Icons von <a href="http://fontawesome.io//" target="_blank">Font Awesome</a>,
        sowie die Javascript-Version von <a href="http://geographiclib.sf.net/html/other.html#javascript" target="_blank">GeographicLib</a>
        für die Distanz-/Winkelberechnungen und die Wegpunktprojektion.
        <br />        
        Der aktuelle Quellcode von <b>Flopps Toller Karte</b> ist auf <a href="https://github.com/flopp/FloppsTolleKarte" target="_blank">github</a> zu finden.
    </p>
    
    <hr />
<!--
<h4>Naturschutzgebiete</h4>
<p>
Informationen über deutsche Naturschutzgebiete werden vom <a href="http://www.nsg-atlas/" target="_blank">NSG-Atlas</a> freundlicherweise zur Verfügung gestellt. Danke dafür!
<br />
Die Informationen über die Naturschutzgebiete dürfen nicht kommerziell genutzt werden und nicht
auf Seiten verwendet werden, die Werbung beinhalten.
<br />
Das Datenmaterial der NSG gehört den einzelnen Ämtern der Länder.
Die bereitgestellten Daten haben keine Rechtsverbindlichkeit.
Details zum Datenmaterial sind auf den <a href="http://www.nsg-atlas.de/Datenmaterial.html" target="_blank">Seiten vom NSG-Atlas</a> zu finden.
</p>
-->

<h4>Kreisgrenzen</h4>
<p>
Die Informationen über die Kreisgrenzen Deutschlands stammen von <a href="http://www.gadm.org/" target="_blank">GADM database of Global Administrative Areas</a> und dürfen für private, nicht-kommerzielle Zwecke entgeltfrei genutzt werden.
</p>

<h4>Geocaching-Daten</h4>
<p>
Die angezeigten Geocache-Daten werden über die <a href="http://www.opencaching.de/okapi/introduction.html">OKAPI-Schnittstelle</a> von den nationalen Opencaching-Seiten 
<a href="http://www.opencaching.de/">Opencaching.de</a>, 
<a href="http://www.opencaching.pl/">Opencaching.pl</a>, 
<a href="http://www.opencaching.nl/">Opencaching.nl</a>,
<a href="http://www.opencaching.org.uk/">Opencaching.org.uk</a>, 
<a href="http://www.opencaching.us/">Opencaching.us</a> geholt und unterliegen den Datenlizenzen der jeweiligen Opencaching-Sites.
</p>
<hr />
<h4>Datenschutz</h4>
<p>
Diese Seite erhebt keine personenbezogenen Daten.
</p>

<hr />
<h4>Cookies</h4>
<p>
Diese Seite verwendet Cookies, um die aktuelle Ansicht der Karte (Zentrum, Position der Marker, gewählter Kartentyp) abzuspeichern und beim erneuten Besuch der Seite wieder zu laden. Selbstverständlich ist das Löschen dieser Cookies bzw. das Unterbinden dieser Cookies in den Browsereinstellungen möglich.
</p>
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" data-dismiss="modal">Ok</button>
  </div>
  </div></div>

</div>
<script> 
function showDlgInfoAjax() {
  $('#dlgInfoAjax').modal({show : true, backdrop: "static", keyboard: true});
} 
</script>


<!-- the alert dialog -->
<div id="dlgAlert" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">
        <h3 id="dlgAlertHeader">Modal header</h3>
    </div>
    <div id="dlgAlertMessage" class="modal-body">Modal body</div>
    <div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal">OK</button></div>
</div>
</div></div>
<script>
function showAlert( title, msg ) {
    $("#dlgAlertHeader").html( title );
    $("#dlgAlertMessage").html( msg );
    $("#dlgAlert").modal({show : true, backdrop: "static", keyboard: true});
}
</script>

<!-- the double input dialog -->
<div id="dlgDoubleInput" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">
        <h3 id="dlgDoubleInputHeader">Modal header</h3>
    </div>
    <div class="modal-body">
        <div id="dlgDoubleInputMessage1">Message1</div>
        <input class="form-control" id="dlgDoubleInputData1" type="text" />
        <div id="dlgDoubleInputMessage2">Message2</div>
        <input class="form-control" id="dlgDoubleInputData2" type="text" />
    </div>
    <div class="modal-footer">
        <button type="button" class="btn" data-dismiss="modal">Abbruch</button>
        <button id="dlgDoubleInputOk" type="button" class="btn btn-primary">OK</button>
    </div>
    </div>
  </div>
</div>

<script>
function showDoubleInputDialog( title, msg1, data1, msg2, data2, callback ) {
    $("#dlgDoubleInputHeader").html( title );
    $("#dlgDoubleInputMessage1").html( msg1 );
    $("#dlgDoubleInputMessage2").html( msg2 );
    $("#dlgDoubleInputData1").val( data1 );
    $("#dlgDoubleInputData2").val( data2 );
    $('#dlgDoubleInputOk').off( 'click' );
    $('#dlgDoubleInputOk').click(function(){
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      $('#dlgDoubleInput').modal('hide');
      if (callback) 
      {
        console.log("timeout");
        setTimeout(function(){callback($("#dlgDoubleInputData1").val(), $("#dlgDoubleInputData2").val());}, 10);
      }
    });
    $("#dlgDoubleInput").modal({show : true, backdrop: "static", keyboard: true});
}
</script>

<div id="linkDialog" class="modal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Permalink</h3>
      </div>
      <div class="modal-body">
        <div>The following URL links to the current view of Flopp's Map including all markers, lines and the selected map type. Copy (<tt>CTRL+C</tt>) the URL and share it with your friends!<br />
        'Shorten' runs the long URL through an URL shortener (<a href="http://goo.gl/" target="_blank">goo.gl</a>) an produces a shortened URL.
        </div>
        <div class="input-group">
          <input class="form-control" id="linkDialogLink" type="text" title="Permalink the the current map view">
          <span class="input-group-btn">
            <button class="btn btn-info" type="button" title="Shorten the permalink" onclick="linkDialogShortenLink()">Shorten</button>
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

<script>
function showLinkDialog(linkUrl)
{
  $('#linkDialogLink').val(linkUrl);
  $('#linkDialog').modal({show : true, backdrop: "static", keyboard: true});
  $('#linkDialogLink').select();
}

function linkDialogShortenLink()
{
  var longUrl = $('#linkDialogLink').val();
  gapi.client.setApiKey('AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0');
  
  gapi.client.load('urlshortener', 'v1', function() {
    var request = gapi.client.urlshortener.url.insert({'resource': {'longUrl': longUrl}});
    var resp = request.execute(function(resp) {
      if (resp.error) 
      {
        $('#linkDialogError').html('Error: ' + resp.error.message);
      } 
      else 
      {
        $('#linkDialogLink').val(resp.id);
        $('#linkDialogLink').select();
      }
    });
  });
}
</script>

  </body>
</html>
