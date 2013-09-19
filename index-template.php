<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="description" content="Vollbildkarte mit Koordinatenbestimmung, Wegpunktprojektion, Abstandsberechnung; Anzeige von Geocaches" />
    <meta name="viewport" content="height = device-height,
    width = device-width,
    initial-scale = 1.0,
    minimum-scale = 1.0,
    maximum-scale = 1.0,
    user-scalable = no,
    target-densitydpi = device-dpi" />
    <title>Flopps Tolle Karte: Wegpunktprojektion, Koordinaten, Abstand</title>
    <link rel="author" href="https://plus.google.com/100782631618812527586" />
    <link rel="icon" href="img/favicon.png" type="image/png" />
    <link rel="shortcut icon" href="img/favicon.png" type="image/png" />
    <link rel="image_src" href="img/screenshot.png" />
    
    <!-- google maps -->
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0&amp;sensor=false"></script>

    <!-- my own stuff -->
    <script type="text/javascript" src="js/conversion.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/cookies.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/geographiclib.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/coordinates.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/map.js?t=TSTAMP"></script>
    <script type="text/javascript" src="js/okapi.js?t=TSTAMP"></script>

    <!-- jquery -->
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>

    <!-- bootstrap + font-awesome -->
    <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script>
    <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.no-icons.min.css" rel="stylesheet" />
    <link href="//netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css" rel="stylesheet" />

    <!-- bootstrap modal -->
    <link  href="ext/bootstrap-modal/css/bootstrap-modal.css" rel="stylesheet" />
    <script src="ext/bootstrap-modal/js/bootstrap-modalmanager.js"></script>
    <script src="ext/bootstrap-modal/js/bootstrap-modal.js"></script>

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

<style type="text/css">
    html, body { height: 100%; overflow: hidden}
    #map-wrapper { position: absolute; left: 0; right:274px; top: 41px; bottom: 0; float: left; }
    #themap { width: 100%; height: 100%;}
    #themap img { max-width: none; }
    #sidebar { overflow: auto; position: absolute; padding: 4px; width: 264px; right: 0; top: 41px; bottom: 0px; float: right; }
    #sidebartoggle { position: absolute; display: block; right: 274px; width: 24px; height: 60px; top: 50%; background-color: white; 
    border-top: 1px solid #ddd;
    border-left: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    -webkit-border-radius: 8px 0 0 8px;
       -moz-border-radius: 8px 0 0 8px;
            border-radius: 8px 0 0 8px;
    }
    #sidebartogglebutton { position: absolute; display: block; width: 14px; height: 14px; top: 50%; left: 50%; margin-left: -5px; margin-top: -10px; }
    
    @media(max-width:599px){.only-small{display:inherit!important}.only-large{display:none!important}}
    @media(min-width:600px){.only-small{display:none!important}.only-large{display:inherit!important}}
   
.my-section {
  position: relative;
  margin: 4px 0;
  padding: 39px 6px 6px;
  *padding-top: 19px;
  background-color: #fff;
  border: 1px solid #ddd;
  -webkit-border-radius: 4px;
     -moz-border-radius: 4px;
          border-radius: 4px;
}

.my-section-header {
  position: absolute;
  top: -1px;
  left: -1px;
  padding: 3px 7px;
  font-size: 16px;
  font-weight: bold;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #444;
  -webkit-border-radius: 4px 0 4px 0;
     -moz-border-radius: 4px 0 4px 0;
          border-radius: 4px 0 4px 0;
}
</style>

</head>
  
<?php
$cntr = "";
$zoom = "";
$maptype = "";
$markers = "";
$markersAB = "";

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
        $markersAB = $_GET['d'];
    }
}

echo "<body onload=\"okapi_setup_sites(); initialize( '$cntr', '$zoom', '$maptype', '$markers', '$markersAB' )\">";
?>


<!-- the menu -->
<div class="navbar navbar-inverse navbar-static-top">
    <div class="navbar-inner">
        <div class="container-fluid">
            <ul class="nav">
                <li class="hidden-phone"><a role="button" class="brand" href="javascript:"><span class="only-large">Flopps Tolle Karte</span><span class="only-small">FTK</span></a></li>
                <li><a role="button" href="http://blog.flopp-caching.de/" rel="tooltip" title="Hier geht es zu 'Flopps Tolles Blog'"><span class="only-large">Blog <i class="icon-star icon-white"></i></span><span class="only-small">Blog
                </span></a></li>
                <li><a role="button" href="http://blog.flopp-caching.de/benutzung-der-karte/" rel="tooltip" title="Hier geht es zu den Hilfeseiten"><span class="only-large">Hilfe <i class="icon-question-sign icon-white"></i></span><span class="only-small">Hilfe</span></a></li>
                <li><a role="button" href="javascript:showDlgInfoAjax()" rel="tooltip" title="Rechtliche Hinweise, Kontaktinformationen, usw."><span class="only-large">Info/Impressum <i class="icon-info-sign icon-white"></i></span><span class="only-small">Info/Impressum</span></a></li>
            </ul>
        </div>
    </div>
</div>

<script type="text/javascript">
    jQuery(document).ready(function() {
        $("#sidebartoggle").click(
        function() {
            if( $('#sidebar').is(':visible') )
            {
                $('#sidebar').hide();
                $('#sidebartoggle').css( "right", "0px" );
                $('#sidebartogglebutton').html( "<i class=\"icon-chevron-left\"></i>" );
                $('#map-wrapper').css("right", "0px");
                google.maps.event.trigger(map, "resize");
            }
            else
            {
                $('#sidebar').show();
                $('#sidebartoggle').css( "right", "274px" );
                $('#sidebartogglebutton').html( "<i class=\"icon-chevron-right\"></i>" );
                $('#map-wrapper').css("right", "274px");
                google.maps.event.trigger(map, "resize");
            }
        });
        
       
        $("#hillshading").click(
        function() {
            toggleHillshadingLayer( $('#hillshading').is(':checked') );
        });        
/*        
        $("#showNSG").click(
        function() {
            showNSGLayer( $('#showNSG').is(':checked') );
        });
*/        
        $("#showKreisgrenzen").click(
        function() {
            toggleBoundaryLayer( $('#showKreisgrenzen').is(':checked') );
        });
        
        $("#showCaches").click(
        function() {
            okapi_toggle_load_caches( $('#showCaches').is(':checked') );
        });
});
</script>


<!-- the map -->
<div id="map-wrapper">
    <div id="themap"></div>
</div>
  

<a id="sidebartoggle" href="javascript:">
<span id="sidebartogglebutton"><i class="icon-chevron-right"></i></span>
</a>
<!-- the control widget -->
<div id="sidebar">

<div class="my-section">
    <div class="my-section-header">Suche</div>
    <div>
<form style="margin: 0" action="javascript:searchLocation()">
<div class="input-append">
<input id="txtSearch" style="width: 179px" type="text" placeholder="Koordinaten oder Ort" title="Nach einem Ort oder Koordinaten suchen und die Karte auf dem Suchergebnis zentrieren">
<button class="btn btn-info" type="submit" style="width: 44px" title="Nach einem Ort oder Koordinaten suchen und die Karte auf dem Suchergebnis zentrieren"><i class="icon-search"></i></button>
</div>
</form>
    </div>
</div> <!-- section -->

<div class="my-section">
    <div class="my-section-header">Marker</div>
    <div>
<button id="btnnewmarker1" class="btn btn-success" title="Erzeuge einen neuen Marker" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )">Neuer Marker</button>
<div id="dynMarkerDiv"></div>
<button id="btnnewmarker2" class="btn btn-success" style="display:none;" title="Erzeuge einen neuen Marker" type="button" onClick="newMarker( map.getCenter(), -1, -1, null )">Neuer Marker</button>
    </div>
</div> <!-- section -->
  
<div class="my-section">
    <div class="my-section-header">Abstand/Winkel</div>
    <div>
<div style="padding:4px">
Von
<select id="sourcelist" style="width: 50px" title="Quelle" onchange="selectSource()"></select>
nach
<select id="targetlist" style="width: 50px" title="Ziel" onchange="selectTarget()"></select>
</div>

<div>
<div class="input-prepend input-append" title="Abstand des Markers A vom Marker B in Metern">
<span class="add-on" style="width: 52px">Abstand</span>
<span id="txtDistance" class="add-on" style="width: 137px; text-align: left">n/a</span>
<span class="add-on" style="width: 16px">m</span>
</div>
<div class="input-prepend input-append" title="Peilungswinkel von Marker A nach Marker B">
<span class="add-on" style="width: 52px">Winkel</span>
<span id="txtBearing" class="add-on" style="width: 137px; text-align: left">n/a</span>
<span class="add-on" style="width: 16px">°</span>
</div>
</div>          

    </div>
</div> <!-- section -->

<div class="my-section">
    <div class="my-section-header">Sonstiges/Links</div>
    <div>
<b>Karten-Ebenen</b>
<!--
<label class="checkbox" title="Deutsche Naturschutzgebiete in der Karte markieren">
    <input id="showNSG" type="checkbox"> Zeige Naturschutzgebiete
</label>
-->
<label class="checkbox" title="Hillshading aktivieren">
    <input id="hillshading" type="checkbox"> Hillshading
</label>
<label class="checkbox" title="Kreisgrenzen anzeigen">
    <input id="showKreisgrenzen" type="checkbox"> Zeige Kreisgrenzen
</label>

<b>Geocaches (<a href="http://www.opencaching.eu/">Opencaching-Network</a>)</b>
<div>
    <label class="checkbox" title="Geocaches auf der Karte anzeigen">
        <input id="showCaches" type="checkbox"> Zeige Geocaches
    </label>
</div>

<b>Permalinks</b>
<ul>
<li><a id="permalink" href="https://foomap.de/" target="_blank">Flopps Tolle Karte</a></li>
</ul>
<b>Externe Links</b>
<div class="input-append" title="Externer Link">
<select id="externallinks" style="width: 193px" title="Externen Dienst an Kartenposition öffnen"></select>
<button class="btn btn-info" style="width: 44px" type="button" onClick="gotoExternalLink()" title="Externen Dienst an Kartenposition öffnen"><i class="icon-play"></i></button>
</div>
    </div>
</div> <!-- section -->

</div> <!-- sidebar -->


<!-- the info dialog -->
<div id="dlgInfoAjax" class="modal hide container" tabindex="-1" role="dialog" aria-hidden="true"></div>
<script> 
function showDlgInfoAjax() {
    var $modal = $('#dlgInfoAjax');
    $modal.load('info-dialog.html?t=1379569428', '', function(){ $modal.modal({ "backdrop" : "static", "keyboard" : true, "show" : true }); }); 
} 
</script>


<!-- the alert dialog -->
<div id="dlgAlert" class="modal hide">
    <div class="modal-header">
        <h3 id="dlgAlertHeader">Modal header</h3>
    </div>
    <div id="dlgAlertMessage" class="modal-body">Modal body</div>
    <div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" aria-hidden="true">OK</button></div>
</div>
<script>
function showAlert( title, msg ) {
    $("#dlgAlertHeader").html( title );
    $("#dlgAlertMessage").html( msg );
    $("#dlgAlert").modal({ "backdrop" : "static", "keyboard" : true, "show" : true });
}
</script>

<!-- the single input dialog -->
<div id="dlgSingleInput" class="modal hide">
    <div class="modal-header">
        <h3 id="dlgSingleInputHeader">Modal header</h3>
    </div>
    <div class="modal-body">
        <div id="dlgSingleInputMessage">Message</div>
        <input class="xlarge" id="dlgSingleInputData" type="text" />
    </div>
    <div class="modal-footer">
        <button type="button" class="btn" data-dismiss="modal" aria-hidden="true">Abbruch</button>
        <button id="dlgSingleInputOk" type="button" class="btn btn-primary" data-dismiss="modal" aria-hidden="true">OK</button>
    </div>
</div>

<script>
function showSingleInputDialog( title, msg, data, callback ) {
    $("#dlgSingleInputHeader").html( title );
    $("#dlgSingleInputMessage").html( msg );
    $("#dlgSingleInputData").val( data );
    $('#dlgSingleInputOk').off( 'click' );
    $('#dlgSingleInputOk').click(function(){
        $('#dlgSingleInput').modal('hide');
        if (callback) callback($("#dlgSingleInputData").val());
    });
    $("#dlgSingleInput").modal({ "backdrop" : "static", "keyboard" : true, "show" : true });
}
</script>

<!-- the double input dialog -->
<div id="dlgDoubleInput" class="modal hide">
    <div class="modal-header">
        <h3 id="dlgDoubleInputHeader">Modal header</h3>
    </div>
    <div class="modal-body">
        <div id="dlgDoubleInputMessage1">Message1</div>
        <input class="xlarge" id="dlgDoubleInputData1" type="text" />
        <div id="dlgDoubleInputMessage2">Message2</div>
        <input class="xlarge" id="dlgDoubleInputData2" type="text" />
    </div>
    <div class="modal-footer">
        <button type="button" class="btn" data-dismiss="modal" aria-hidden="true">Abbruch</button>
        <button id="dlgDoubleInputOk" type="button" class="btn btn-primary" data-dismiss="modal" aria-hidden="true">OK</button>
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
        $('#dlgDoubleInput').modal('hide');
        if (callback) callback($("#dlgDoubleInputData1").val(), $("#dlgDoubleInputData2").val());
    });
    $("#dlgDoubleInput").modal({ "backdrop" : "static", "keyboard" : true, "show" : true });
}
</script>


  </body>

</html>
