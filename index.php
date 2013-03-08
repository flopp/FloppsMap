<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="description" content="Vollbildkarte mit Koordinatenbestimmung, Wegpunktprojektion, Abstandsberechnung und Anzeige von Naturschutzgebieten">
    <meta http-equiv="content-language" content="de">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="expires" content="604800"> <!-- force reload after 1 week -->
    <title>Flopps Tolle Karte: Wegpunktprojektion, Koordinaten, Abstand</title>
    <link rel="author" href="https://plus.google.com/100782631618812527586" />
    <link rel="icon" href="img/favicon.png" type="image/png" />
    <link rel="shortcut icon" href="img/favicon.png" type="image/png" />
    <link rel="image_src" href="img/screenshot.png" />
    
    <!-- google maps -->
    <script type="text/javascript" src="https://maps.google.com/maps/api/js?key=AIzaSyC_KjqwiB6tKCcrq2aa8B3z-c7wNN8CTA0&sensor=false"></script>
    <!-- my own stuff -->
    <script type="text/javascript" src="js/conversion.js"></script>
    <script type="text/javascript" src="js/cookies.js"></script>
    <script type="text/javascript" src="js/geographiclib.js"></script>
    <script type="text/javascript" src="js/coordinates.js"></script>
    <script type="text/javascript" src="js/map.js"></script>
    <!-- jquery -->
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
    <link type="text/css" rel="stylesheet" href="ext/jquery-dropdown/jquery.dropdown.css" />`
    <script type="text/javascript" src="ext/jquery-dropdown/jquery.dropdown.js"></script>`
    <!-- bootstrap -->
    <link href="ext/bootstrap/css/bootstrap.min.css" rel="stylesheet"></link>
    <script type="text/javascript" src="ext/bootstrap/js/bootstrap.min.js"></script>
    <!-- bootstrap modal -->
    <link  href="ext/bootstrap-modal/css/bootstrap-modal.css" rel="stylesheet"></link>
    <script src="ext/bootstrap-modal/js/bootstrap-modalmanager.js"></script>
    <script src="ext/bootstrap-modal/js/bootstrap-modal.js"></script>
    <!-- additional button icons -->
    <link rel="stylesheet" href="ext/font-awesome/css/font-awesome.min.css"> 

<!-- Google Analytics -->
<script type="text/javascript">
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-27729857-4']);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
</script>

<style type="text/css">
    html, body { height: 100%; overflow: hidden}
    #map-wrapper { position: absolute; left: 0; right:274px; top: 40px; bottom: 0; float: left; }
    #themap { width: 100%; height: 100%;}
    #themap img { max-width: none; }
    #sidebar { overflow: auto; position: absolute; padding: 4px; width: 264px; right: 0; top: 40px; bottom: 0px; float: right; }
    #sidebartoggle { position: absolute; display: block; right: 274px; width: 20px; height: 60px; top: 50%; background-color: white; 
    webkit-border-radius: 8px 0 0 8px;
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
}

echo "<body onload=\"initialize( '$cntr', '$zoom', '$maptype', '$markers' )\">";
?>


<!-- the menu -->
<div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
        <div class="container-fluid">
            <ul class="nav">
                <li class="hidden-phone"><a role="button" class="brand" href="javascript:"><span class="only-large">Flopps Tolle Karte</span><span class="only-small">FTK</span></a></li>
                <li><a role="button" href="http://blog.flopp-caching.de/" rel="tooltip" title="Hier geht es zu 'Flopps Tolles Blog'"><span class="only-large">Blog <i class="icon-star icon-white"></i></span><span class="only-small">Blog</span></a></li>
                <!--<li><a role="button" href="javascript:showDlgHelp()" rel="tooltip" title="Anleitung für die Karte"><span class="only-large">Hilfe <i class="icon-question-sign icon-white"></i></span><span class="only-small">Hilfe</span></a></li>-->
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
        
        $("#showNSG").click(
        function() {
            if( $('#showNSG').is(':checked') )
            {
                showNSGLayer( true );
            }
            else
            {
                showNSGLayer( false );
            }
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
<form action="javascript:searchLocation()">
<div class="input-append">
<input id="txtSearch" style="width: 173px" type="text" placeholder="Koordinaten oder Ort" title="Nach einem Ort oder Koordinaten suchen und die Karte auf dem Suchergebnis zentrieren">
<button class="btn btn-info" type="submit" style="width: 44px" type="button" title="Nach einem Ort oder Koordinaten suchen und die Karte auf dem Suchergebnis zentrieren"><i class="icon-search"></i></button>
</div>
</form>
    </div>
</div> <!-- section -->



<div class="my-section">
    <div class="my-section-header">Marker</div>
    <div>
<button class="btn btn-success"  title="Erzeuge einen neuen Marker" type="button" onClick="newMarker( map.getCenter(), -1, -1 )">Neuer Marker</button>
<div id="dynMarkerDiv"></div>
    </div>
</div> <!-- section -->
  
<div class="my-section">
    <div class="my-section-header">Abstand/Winkel</div>
    <div>
<div style="padding:4px">
Von
<button id="sourcebtn" class="btn btn-small btn-info" title="Wähle Marker" type="button" href="#" data-dropdown="#sourcelist">?</button>
nach
<button id="targetbtn" class="btn btn-small btn-info" title="Wähle Marker" type="button" href="#" data-dropdown="#targetlist">?</button>
</div>

<div>
<div class="input-prepend input-append" title="Abstand des Markers A vom Marker B in Metern">
<span class="add-on" style="width: 52px">Abstand</span>
<span id="txtDistance" class="add-on" style="width: 128px; text-align: left">n/a</span>
<span class="add-on" style="width: 16px">m</span>
</div>
<div class="input-prepend input-append" title="Peilungswinkel von Marker A nach Marker B">
<span class="add-on" style="width: 52px">Winkel</span>
<span id="txtBearing" class="add-on" style="width: 128px; text-align: left">n/a</span>
<span class="add-on" style="width: 16px">°</span>
</div>
</div>          

    </div>
</div> <!-- section -->

<div class="my-section">
    <div class="my-section-header">Sonstiges/Links</div>
    <div>
<form>
<label class="checkbox" title="Deutsche Naturschutzgebiete in der Karte markieren">
    <input id="showNSG" type="checkbox"> Zeige Naturschutzgebiete
</label>
</form>

<b>Permalinks</b>
<ul>
<li><a id="permalink" href="https://foomap.de/" target="_blank">Flopps Tolle Karte</a></li>
</ul>
<b>Externe Links</b>
<div class="input-append" title="Externer Link">
<select id="externallinks" style="width: 185px" title="Externen Dienst an Kartenposition öffnen"></select>
<button class="btn btn-info" style="width: 44px" type="button" onClick="gotoExternalLink()" title="Externen Dienst an Kartenposition öffnen"><i class="icon-play"></i></button>
</div>
    </div>
</div> <!-- section -->

</div> <!-- sidebar -->

<!-- the help dialog -->
<!--
<div id="dlgHelp" class="modal hide" tabindex="-1" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal">&times;</button>
    <h3 >Wie funktioniert die Karte?</h3>
  </div>
  <div class="modal-body">
      <h4>Hier muss alles neu geschrieben werden...</h4>
      Bis das geschehen ist, kann man im <a href="http://blog.flopp-caching.de/category/karte/">Blog</a> nützliche Informationen finden.
  </div>
  <div class="modal-footer">
      <button type="button" data-dismiss="modal" class="btn">Ok</button>
  </div>
</div>
<script> function showDlgHelp() { $("#dlgHelp").modal({ "backdrop" : "static", "keyboard" : true, "show" : true }); } </script>
-->

<!-- the info dialog -->
<div id="dlgInfoAjax" class="modal hide container" tabindex="-1" role="dialog" aria-hidden="true"></div>
<script> 
function showDlgInfoAjax() {
    var $modal = $('#dlgInfoAjax');
    $modal.load('info-dialog.html', '', function(){ $modal.modal({ "backdrop" : "static", "keyboard" : true, "show" : true }); }); 
} 
</script>

<!-- the welcome dialog -->
<!--
<div id="dlgWelcome" class="modal hide" tabindex="-1" role="dialog">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal">&times;</button>
    <h3>Willkommen!</h3>
  </div>
  <div class="modal-body">
<p>
    <h4>Willkommen bei <i>Flopps Toller Karte</i>!</h4>
</p>
<p>
    Wie man diese Online-Karte benutzt und welche Möglichkeiten man hat, erfährst du mit einem Klick auf <i>Hilfe</i> in der Titelleiste. Viel Spaß!
</p>
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" data-dismiss="modal">Ok</button>
  </div>
</div>
-->


<div id="sourcelist" class="dropdown-menu has-tip">
    <ul>
        <li>Keine Marker :(</li>
    </ul>
</div>

<div id="targetlist" class="dropdown-menu has-tip">
    <ul>
        <li>Keine Marker :(</li>
    </ul>
</div>


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
        <button type="button" class="btn" data-dismiss="modal" aria-hidden="true">Abbruch</a>
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
        <button type="button" class="btn" data-dismiss="modal" aria-hidden="true">Abbruch</a>
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
