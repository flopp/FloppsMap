function id2alpha(id) {
  if (id >= 0 && id < 26*10) {
    var s1 = String.fromCharCode('A'.charCodeAt() + (id%26));
    var s2 = String.fromCharCode('0'.charCodeAt() + (id/26));
    if (s2 == "0") {
        s2 = "";
    }
    return s1 + s2;
  }
  return "";
}

function alpha2id(alpha) {
  if (alpha.length < 1 || alpha.length > 2) return -1;

  alpha = alpha.toLowerCase();
  letter = 0;
  number = 0;

  if (alpha[0] >= 'a' && alpha[0] <= 'z') {
    letter = alpha.charCodeAt(0) - 'a'.charCodeAt(0);
  } else {
    return -1;
  }

  if (alpha.length == 2) {
    if (alpha[1] >= '0' && alpha[1] <= '9') {
        number = alpha.charCodeAt(1) - '0'.charCodeAt(0);
    } else {
        return -1;
    }
  }

  return number*26 + letter;
}

/// Marker

function Marker(id) {
  this.m_id = id;
  this.m_alpha = id2alpha(id);
  this.m_free = true;
  this.m_name = "";
  this.m_marker = null;
  this.m_circle = null;
}

Marker.prototype.toString = function () {
  return this.getAlpha() + ":" + this.getPosition().lat().toFixed(6) + ":" + this.getPosition().lng().toFixed(6) + ":" + this.getRadius() + ":" + this.getName();
};

Marker.prototype.isFree = function() {
  return this.m_free;
};

Marker.prototype.clear = function() {
  if (this.m_free) {
    return;
  }

  this.m_free = true;
  this.m_marker.setMap(null);
  this.m_marker = null;
  this.m_circle.setMap(null);
  this.m_circle = null;

  theLines.updateLinesMarkerRemoved(this.m_id);

  $('#dyn' + this.m_id).remove();

  if (theMarkers.getUsedMarkers() === 0) {
    $('#btnmarkers2').hide();
  }

  theMarkers.saveMarkersList();
}

Marker.prototype.getId = function () {
  return this.m_id;
};

Marker.prototype.getAlpha = function () {
  return this.m_alpha;
};

Marker.prototype.getName = function () {
  return this.m_name;
};

Marker.prototype.setName = function (name) {
  this.m_name = name;
  this.update();
};

Marker.prototype.setPosition = function (position) {
  this.m_marker.setPosition(position);
  this.m_circle.setCenter(position);
  this.update();
};

Marker.prototype.getPosition = function () {
  return this.m_marker.getPosition();
};

Marker.prototype.setRadius = function (radius) {
  this.m_circle.setRadius(radius);
  this.update();
};

Marker.prototype.getRadius = function () {
  return this.m_circle.getRadius();
};

Marker.prototype.setNamePositionRadius = function (name, position, radius) {
  this.m_name = name;
  this.m_marker.setPosition(position);
  this.m_circle.setCenter(position);
  this.m_circle.setRadius(radius);
  this.update();
};

Marker.prototype.initialize = function (name, position, radius) {
  this.m_free = false;
  this.m_name = name;

  // marker.png is 26x10 icons (each: 33px x 37px)
  var iconw = 33;
  var iconh = 37;
  var offsetx = (this.m_id % 26)*iconw;
  var offsety = Math.floor(this.m_id / 26)*iconh;
  this.m_marker = new google.maps.Marker( {
    position: position,
    map: map,
    icon: new google.maps.MarkerImage(
      "img/markers.png",
      new google.maps.Size(iconw, iconh),
      new google.maps.Point(offsetx, offsety),
      new google.maps.Point(16.5,36) ),
    draggable: true } );

  var theMarker = this;
  google.maps.event.addListener(this.m_marker, "drag", function() { theMarker.update(); });
  google.maps.event.addListener(this.m_marker, "dragend", function() { theMarker.update(); });

  var color = "#0090ff";

  this.m_circle = new google.maps.Circle( {
    center: position,
    map: map,
    strokeColor: color,
    strokeOpacity: 1,
    fillColor: color,
    fillOpacity: 0.25,
    strokeWeight: 1,
    radius: radius } );
};

Marker.prototype.update = function () {
  if (this.m_free) {
    return;
  }

  var pos = this.m_marker.getPosition();
  var radius = this.m_circle.getRadius();

  this.m_circle.setCenter(pos);

  Cookies.set('marker' + this.m_id, pos.lat().toFixed(6) + ":" + pos.lng().toFixed(6) + ":" + radius + ":" + this.m_name, {expires:30});
  $('#view_name' + this.m_alpha).html(this.m_name);
  $('#view_coordinates' + this.m_alpha).html(Coordinates.toString(pos));
  $('#view_circle' + this.m_alpha).html(radius);
  $('#edit_name' + this.m_alpha).val(this.m_name);
  $('#edit_coordinates' + this.m_alpha).val(Coordinates.toString(pos));
  $('#edit_circle' + this.m_alpha).val(radius);

  theLines.updateLinesMarkerMoved(this.m_id);
};

/// Markers

var Markers = function () {
  this.m_markers = new Array(26*10);

  for (var id = 0; id != this.getSize(); id = id + 1) {
    this.m_markers[id] = new Marker(id);
  }
}

Markers.prototype.getSize = function () {
  return this.m_markers.length;
}
Markers.prototype.getById = function (id) {
  return this.m_markers[id];
}
Markers.prototype.getUsedMarkers = function () {
  var count = 0;
  this.m_markers.map(function (marker) { if (!marker.isFree()) { count = count + 1; } });
  return count;
}
Markers.prototype.getFreeId = function () {
  for (var id = 0; id < this.m_markers.length; id = id + 1) {
    if (this.m_markers[id].isFree()) {
      return id;
    }
  }
  return -1;
}
Markers.prototype.getNextUsedId = function(id) {
  for (var i = id+1; i < this.m_markers.length; i = i + 1) {
    if (!this.m_markers[i].isFree()) {
      return i;
    }
  }
  return -1;
}
Markers.prototype.removeById = function (id) {
  this.m_markers[id].clear();
}
Markers.prototype.deleteAll = function () {
  this.m_markers.map(function(marker) { marker.clear(); });
}
Markers.prototype.saveMarkersList = function () {
  var ids = Array();
  this.m_markers.map(function (marker) { if (!marker.isFree()) { ids.push(marker.getId()); }});
  Cookies.set('markers', ids.join(":"), {expires:30});
}
Markers.prototype.toString = function () {
  var parts = new Array();
  this.m_markers.map(function (marker) { if (!marker.isFree()) { parts.push(marker.toString()); }});
  return parts.join("*");
}
Markers.prototype.update = function () {
  this.m_markers.map(function (marker) { marker.update(); });
}
