function Marker(id) {
  "use strict";
  this.m_id = id;
  this.m_alpha = id2alpha(id);
  this.m_free = true;
  this.m_name = "";
  this.m_marker = null;
  this.m_circle = null;
}

Marker.prototype.m_id = -1;
Marker.prototype.m_alpha = "?";
Marker.prototype.m_free = true;
Marker.prototype.m_name = "";
Marker.prototype.m_marker = null;
Marker.prototype.m_circle = null;

Marker.prototype.toString = function () {
  "use strict";
  return this.getAlpha() + ":" + this.getPosition().lat().toFixed(6) + ":" + this.getPosition().lng().toFixed(6) + ":" + this.getRadius() + ":" + this.getName();
};

Marker.prototype.isFree = function() {
  "use strict";
  return this.m_free;
};

Marker.prototype.clear = function() {
  "use strict";
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
  "use strict";
  return this.m_id;
};

Marker.prototype.getAlpha = function () {
  "use strict";
  return this.m_alpha;
};

Marker.prototype.getName = function () {
  "use strict";
  return this.m_name;
};

Marker.prototype.setName = function (name) {
  "use strict";
  this.m_name = name;
  this.update();
};

Marker.prototype.setPosition = function (position) {
  "use strict";
  this.m_marker.setPosition(position);
  this.m_circle.setCenter(position);
  this.update();
};

Marker.prototype.getPosition = function () {
  "use strict";
  return this.m_marker.getPosition();
};

Marker.prototype.setRadius = function (radius) {
  "use strict";
  this.m_circle.setRadius(radius);
  this.update();
};

Marker.prototype.getRadius = function () {
  "use strict";
  return this.m_circle.getRadius();
};

Marker.prototype.setNamePositionRadius = function (name, position, radius) {
  "use strict";
  this.m_name = name;
  this.m_marker.setPosition(position);
  this.m_circle.setCenter(position);
  this.m_circle.setRadius(radius);
  this.update();
};

Marker.prototype.initialize = function (name, position, radius) {
  this.m_free = false;
  this.m_name = name;

  // base.png is 7x4 icons (each: 32px x 37px)
  var iconw = 32;
  var iconh = 37;
  var offsetx = (this.m_id % 7)*iconw;
  var offsety = Math.floor(this.m_id / 7)*iconh;
  this.m_marker = new google.maps.Marker( {
    position: position,
    map: map,
    icon: new google.maps.MarkerImage(
      "img/base.png",
      new google.maps.Size(iconw, iconh),
      new google.maps.Point(offsetx, offsety),
      new google.maps.Point(15.5,36) ),
    draggable: true } );

  var theMarker = this;
  google.maps.event.addListener(this.m_marker, "drag", function() { theMarker.update(); });
  google.maps.event.addListener(this.m_marker, "dragend", function() { theMarker.update(); });

  var colors = [ "#03ab17", "#d10f12", "#0d58d9", "#9d0ac2", "#ff8a22", "#27bcd6", "#3d3d3d" ];

  this.m_circle = new google.maps.Circle( {
    center: position,
    map: map,
    strokeColor: colors[this.m_id % 7],
    strokeOpacity: 1,
    fillColor: colors[this.m_id % 7],
    fillOpacity: 0.25,
    strokeWeight: 1,
    radius: radius } );
};

Marker.prototype.update = function () {
  "use strict";
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

function Markers() {
  "use strict";
  this.m_markers = new Array(26);
  var id;
  for (id = 0; id !== 26; id = id + 1) {
    this.m_markers[id] = new Marker(id);
  }
}

Markers.prototype.m_markers = null;

Markers.prototype.getSize = function () {
  "use strict";
  return this.m_markers.length;
};

Markers.prototype.getById = function (id) {
  "use strict";
  return this.m_markers[id];
};


Markers.prototype.getUsedMarkers = function () {
  var count = 0;
  this.m_markers.map(function (marker) { if (!marker.isFree()) { count = count + 1; } });
  return count;
}

Markers.prototype.getFreeId = function () {
  "use strict";
  var id;
  for (id = 0; id < this.m_markers.length; id = id + 1) {
    if (this.m_markers[id].isFree()) {
      return id;
    }
  }
  return -1;
};

Markers.prototype.removeById = function (id) {
  "use strict";
  this.m_markers[id].clear();
};

Markers.prototype.deleteAll = function () {
  "use strict";
  this.m_markers.map(function(marker) { marker.clear(); });
};

Markers.prototype.saveMarkersList = function () {
  "use strict";
  var ids = Array();
  this.m_markers.map(function (marker) { if (!marker.isFree()) { ids.push(marker.getId()); }});
  Cookies.set('markers', ids.join(":"), {expires:30});
};

Markers.prototype.toString = function () {
  "use strict";
  var parts = new Array();
  this.m_markers.map(function (marker) { if (!marker.isFree()) { parts.push(marker.toString()); }});
  return parts.join("*");
};

Markers.prototype.update = function () {
  "use strict";
  this.m_markers.map(function (marker) { marker.update(); });
};
