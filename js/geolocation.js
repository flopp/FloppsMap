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
          var title = trans("dialog.search_error.title");
          var content = trans("dialog.search_error.content").replace(/%1/, address);
          showAlert(title, content);
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
          var title = trans("dialog.whereami_error.title");
          var content = trans("dialog.whereami_error.content");
          showAlert(title, content);
      }
    );
  } else {
    var title = trans("dialog.whereami_error.title");
    var content = trans("dialog.whereami_error.content");
    showAlert(title, content);
  }
}
