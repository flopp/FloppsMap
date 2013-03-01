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
    <script type="text/javascript" src="js/cookies.js"></script>
    <script type="text/javascript" src="js/geographiclib.js"></script>
    <script type="text/javascript" src="js/coordinates.js"></script>
    <script type="text/javascript" src="js/map.js"></script>
    <!-- jquery -->
    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
    <link type="text/css" rel="stylesheet" href="ext/jquery-dropdown/jquery.dropdown.css" />`
    <script type="text/javascript" src="ext/jquery-dropdown/jquery.dropdown.js"></script>`
    <!-- bootstrap -->
    <script type="text/javascript" src="ext/bootstrap/js/bootstrap.min.js"></script>
    <link href="ext/bootstrap/css/bootstrap.min.css" rel="stylesheet">
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
                <li><a role="button" href="#hilfeDialog" data-toggle="modal" rel="tooltip" title="Anleitung für die Karte"><span class="only-large">Hilfe <i class="icon-question-sign icon-white"></i></span><span class="only-small">Hilfe</span></a></li>
                <li><a role="button" href="#kontaktDialog" data-toggle="modal" rel="tooltip" title="Rechtliche Hinweise, Kontaktinformationen, usw."><span class="only-large">Info/Impressum <i class="icon-info-sign icon-white"></i></span><span class="only-small">Info/Impressum</span></a></li>
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

<!-- the hilfe dialog -->
<div class="modal hide fade" id="hilfeDialog" tabindex="-1" role="dialog" aria-labelledby="hilfeDialogLabel" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="hilfeDialogLabel">Wie funktioniert die Karte?</h3>
  </div>
  <div class="modal-body">
      <h4>Hier muss alles neu geschrieben werden...</h4>
      Bis das geschehen ist, kann man im <a href="http://blog.flopp-caching.de/category/karte/">Blog</a> nützliche Informationen finden.
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" data-dismiss="modal" aria-hidden="true">Ok</button>
  </div>
</div> <!-- dialog -->

<!-- the kontakt dialog -->
<div class="modal hide fade" id="kontaktDialog" tabindex="-1" role="dialog" aria-labelledby="kontaktDialogLabel" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="kontaktDialogLabel">Kontakt/Info</h3>
  </div>
  <div class="modal-body">
    <img class="img-polaroid" width="100ps" height="100px" style="float: right" src="avatar.jpg" alt="Flopp">
    <h4>Kontakt</h4>
    <p>Neuigkeiten und aktuelle Informationen werden über das <a href="http://blog.flopp-caching.de/" alt="Blog">zugehörige Blog</a> verbreitet.</p>
    <p>Fragen und Anregungen nehme ich gerne per <a href="mailto:mail@flopp-caching.de" target="_blank">Mail</a> oder <a href="https://twitter.com/floppgc" target="_blank">Twitter</a> entgegen. Außerdem gibt es Seiten bei <a href="https://plus.google.com/u/0/116067328889875491676" target="_blank">Google+</a> und bei <a href="https://www.facebook.com/FloppsTolleKarte" target="_blank">Facebook</a>.</p>
    <p>Bugs können auch via <a href="https://github.com/flopp/FloppsTolleKarte" target="_blank">github</a> gemeldet werden.</p>
    <p>Flopps Tolle Karte ist unter den URLs <a href="http://flopp-caching.de/">flopp-caching.de</a> und <a href="http://foomap.de/">foomap.de</a> erreichbar.</p>
    <p>
        <a href="mailto:mail@flopp-caching.de" target="_blank"><img src="img/email.png" alt="E-Mail"></a>
        <a href="https://twitter.com/floppgc" target="_blank"><img src="img/twitter.png" alt="Twitter"></a>
        <a href="https://plus.google.com/u/0/116067328889875491676" target="_blank"><img src="img/googleplus.png" alt="Google+"></a>
        <a href="https://www.facebook.com/FloppsTolleKarte" target="_blank"><img src="img/facebook.png" alt="Facebook"></a>
    </p>
    
    <hr />
    <h4>Impressum</h4>
    <p>Dies ist ein rein privates, werbe- und kostenfreies Informationsangebot
zum Hobby Geocaching. Als nicht geschäftsmäßiges Angebot unterliegt diese
Seite gemäß Telemediengesetz nicht der Impressumspflicht.</p>

    <hr />
    <h4>Hinter den Kulissen...</h4>
    <p>
        <b>Flopps Tolle Karte</b> benutzt <a href="https://developers.google.com/maps/" target="_blank">Google Maps</a> 
        und <a href="http://openstreetmap.org/" target="_blank">OpenStreetMap</a> als Kartenlieferanten, 
        <a href="http://twitter.github.com/bootstrap/index.html" target="_blank">Bootstrap</a> 
        und <a href="http://jquery.com/" target="_blank">jQuery</a> für die Elemente des Userinterfaces,
        die Icons von <a href="http://glyphicons.com/" target="_blank">Glyphicons</a> und <a href="http://www.awicons.com/" target="_blank">Lokas Software</a>,
        sowie die Javascript-Version von <a href="http://geographiclib.sf.net/html/other.html#javascript" target="_blank">GeographicLib</a>
        für die Distanz-/Winkelberechnungen und die Wegpunktprojektion.
        <br />        
        Der aktuelle Quellcode von <b>Flopps Toller Karte</b> ist auf <a href="https://github.com/flopp/FloppsTolleKarte" target="_blank">github</a> zu finden.
    </p>
    
    <hr />
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

<hr />
<h4>Google Analytics</h4>
<p>
Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Inc. ("Google"). Google Analytics verwendet sog. "Cookies", Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen. Die durch den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google in den USA übertragen und dort gespeichert. Im Falle der Aktivierung der IP-Anonymisierung auf dieser Webseite wird Ihre IP-Adresse von Google jedoch innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den Europäischen Wirtschaftsraum zuvor gekürzt.

Nur in Ausnahmefällen wird die volle IP-Adresse an einen Server von Google in den USA übertragen und dort gekürzt. Im Auftrag des Betreibers dieser Website wird Google diese Informationen benutzen, um Ihre Nutzung der Website auszuwerten, um Reports über die Websiteaktivitäten zusammenzustellen und um weitere mit der Websitenutzung und der Internetnutzung verbundene Dienstleistungen gegenüber dem Websitebetreiber zu erbringen. Die im Rahmen von Google Analytics von Ihrem Browser übermittelte IP-Adresse wird nicht mit anderen Daten von Google zusammengeführt.

Sie können die Speicherung der Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern; wir weisen Sie jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen können. Sie können darüber hinaus die Erfassung der durch das Cookie erzeugten und auf Ihre Nutzung der Website bezogenen Daten (inkl. Ihrer IP-Adresse) an Google sowie die Verarbeitung dieser Daten durch Google verhindern, indem sie das unter dem folgenden Link verfügbare Browser-Plugin herunterladen und installieren: <a href="http://tools.google.com/dlpage/gaoptout?hl=de">http://tools.google.com/dlpage/gaoptout?hl=de</a>.
</p>
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" data-dismiss="modal" aria-hidden="true">Ok</button>
  </div>
</div> <!-- dialog -->

<!-- the welcome dialog -->
<div id="welcomeDialog" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="welcomeDialogLabel" aria-hidden="true">
  <div class="modal-header">
    <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
    <h3 id="welcomeDialogLabel">Willkommen!</h3>
  </div>
  <div class="modal-body">
<p>
    <h4>Willkommen bei <i>Flopps Toller Karte</i>!</h4>
</p>
<p>
    Wie man diese Online-Karte benutzt und welche Möglichkeiten man hat, erfährst du mit einem Klick auf <i>Hilfe</i> in der Titelleiste. Viel Spaß!
</p>
<p id="news">
    <h4>Neuigkeiten</h4>
    <ul>
        <li><b>2013/02/10</b> Karte durch "beta" Karte ersetzt. Die "alte" Version der Karte ist unter <a href="http://flopp-caching.de/alt.php">http://flopp-caching.de/alt.php</a> zu finden.</li>
        <li><b>2013/01/25</b> Es werden nun transparente Kreise mit änderbarem Radius um die Marker gezeichnet.</li>
        <li><b>2013/01/01</b> Externe Links zu diversen Karten: Google Maps, Geocaching.com, <a href="http://opencaching.de/">Opencaching.de</a>.</li>        
        <li><b>2012/12/18</b> Link zur Karte von <a href="http://www.ingress.com/">Ingress</a>.</li>        
        <li><b>2012/12/01</b> Neues Sidebar-Design.</li>        
        <li><b>2012/11/29</b> Kooperation mit dem <a href="http://www.nsg-atlas.de/" target="_blank">NSG-Atlas</a>: Naturschutzgebiete können eingeblendet werden.</li>        
        <li><b>2012/11/20</b> Es können Permalinks für die aktuelle Kartenansicht erzeugt werden.</li>
        <li><b>2012/11/16</b> Die Karte ist jetzt auch unter <a href="http://foomap.de/">foomap.de</a> erreichbar.</li>
        <li><b>2012/11/09</b> Anzeige des Kartenmaßstabs hinzugefügt.</li>
        <li><b>2012/11/05</b> Rundungsfehler bei der internen Berechnung von Koordinaten behoben.</li>
        <li><b>2012/11/05</b> Die Koordinaten der Marker können jetzt über den Button <span class="btn btn-small"><i class="icon-pencil"></i></span> direkt geändert werden.</li>
    </ul>
</p>
  </div>
  <div class="modal-footer">
    <button class="btn btn-primary" data-dismiss="modal" aria-hidden="true">Ok</button>
  </div>
</div> <!-- dialog -->



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

  </body>

</html>
