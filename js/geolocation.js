function Geolocation() {
}
    
Geolocation.prototype.search = function (address) {
  trackSearch(address);

  var coords = Coordinates.fromString(new String(address));
  if (!coords) { 
    url="http://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + address;
    $.get(url).done(function(data) {
      if (data.length > 0) {
        coords = new google.maps.LatLng(data[0].lat, data[0].lon);
        map.setCenter(coords);
      } else {
        var title = mytrans("dialog.search_error.title");
        var content = mytrans("dialog.search_error.content").replace(/%1/, address);
        showAlert(title, content);
      }
    }).fail(function(data) {
      var title = mytrans("dialog.search_error.title");
      var content = mytrans("dialog.search_error.content").replace(/%1/, address);
      showAlert(title, content);
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
          var title = mytrans("dialog.whereami_error.title");
          var content = mytrans("dialog.whereami_error.content");
          showAlert(title, content);
      }
    );
  } else {
    var title = mytrans("dialog.whereami_error.title");
    var content = mytrans("dialog.whereami_error.content");
    showAlert(title, content);
  }
}
