function Geolocation() {
  this.m_geocoder = new google.maps.Geocoder();
}
    
Geolocation.prototype.search = function (address) {
  trackSearch(address);

  var coords = Coordinates.fromString(new String(address));
  if (!coords) { 
    this.m_geocoder.geocode( { address: address, region: 'de' }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
      } else {
        showAlert( TT("Information"), TT("Cannot find location of \"%1\".", "Kann Koordinaten von \"%1\" nicht bestimmen.").replace( /%1/, address ) );
      }
    });
  } else {
    map.setCenter(coords);
  }
}

Geolocation.prototype.whereAmI = function () {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
      }, 
      function() {
        showAlert(TT("Failed to determine current location.", "Kann aktuellen Aufenthaltsort nicht bestimmen."));
      }
    );
  } else {
    showAlert(TT("Failed to determine current location.", "Kann aktuellen Aufenthaltsort nicht bestimmen."));
  }
}
