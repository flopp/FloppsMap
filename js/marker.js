/*jslint
  indent: 4
*/

/*global
  $, google,
  Cookies, Coordinates, Lines,
  id2alpha
*/

function Marker(parent, id) {
    'use strict';

    this.m_parent = parent;
    this.m_id = id;
    this.m_alpha = id2alpha(id);
    this.m_free = true;
    this.m_name = "";
    this.m_marker = null;
    this.m_circle = null;
}


Marker.prototype.toString = function () {
    'use strict';

    return this.getAlpha() + ":" + this.getPosition().lat().toFixed(6) + ":" + this.getPosition().lng().toFixed(6) + ":" + this.getRadius() + ":" + this.getName();
};


Marker.prototype.isFree = function () {
    'use strict';

    return this.m_free;
};


Marker.prototype.clear = function () {
    'use strict';

    if (this.m_free) {
        return;
    }

    this.m_free = true;
    this.m_marker.setMap(null);
    this.m_marker = null;
    this.m_circle.setMap(null);
    this.m_circle = null;

    $('#dyn' + this.m_id).remove();

    Lines.updateLinesMarkerRemoved(this.m_id);
    this.m_parent.handleMarkerCleared();
};


Marker.prototype.getId = function () {
    'use strict';

    return this.m_id;
};


Marker.prototype.getAlpha = function () {
    'use strict';

    return this.m_alpha;
};


Marker.prototype.getName = function () {
    'use strict';

    return this.m_name;
};


Marker.prototype.setName = function (name) {
    'use strict';

    this.m_name = name;
    this.update();
};


Marker.prototype.setPosition = function (position) {
    'use strict';

    this.m_marker.setPosition(position);
    this.m_circle.setCenter(position);
    this.update();
};


Marker.prototype.getPosition = function () {
    'use strict';

    return this.m_marker.getPosition();
};


Marker.prototype.setRadius = function (radius) {
    'use strict';

    this.m_circle.setRadius(radius);
    this.update();
};


Marker.prototype.getRadius = function () {
    'use strict';

    return this.m_circle.getRadius();
};


Marker.prototype.setNamePositionRadius = function (name, position, radius) {
    'use strict';

    this.m_name = name;
    this.m_marker.setPosition(position);
    this.m_circle.setCenter(position);
    this.m_circle.setRadius(radius);
    this.update();
};


Marker.prototype.initialize = function (map, name, position, radius) {
    'use strict';

    this.m_free = false;
    this.m_name = name;

    // marker.png is 26x10 icons (each: 33px x 37px)
    var self = this,
        iconw = 33,
        iconh = 37,
        offsetx = (this.m_id % 26) * iconw,
        offsety = Math.floor(this.m_id / 26) * iconh,
        color = "#0090ff";

    this.m_marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: new google.maps.MarkerImage(
            "img/markers.png",
            new google.maps.Size(iconw, iconh),
            new google.maps.Point(offsetx, offsety),
            new google.maps.Point(0.5 * iconw, iconh - 1)
        ),
        draggable: true
    });

    google.maps.event.addListener(this.m_marker, "drag", function () { self.update(); });
    google.maps.event.addListener(this.m_marker, "dragend", function () { self.update(); });

    this.m_circle = new google.maps.Circle({
        center: position,
        map: map,
        strokeColor: color,
        strokeOpacity: 1,
        fillColor: color,
        fillOpacity: 0.25,
        strokeWeight: 1,
        radius: radius
    });
};


Marker.prototype.update = function () {
    'use strict';

    if (this.m_free) {
        return;
    }

    var pos = this.m_marker.getPosition(),
        radius = this.m_circle.getRadius();

    this.m_circle.setCenter(pos);

    Cookies.set('marker' + this.m_id, pos.lat().toFixed(6) + ":" + pos.lng().toFixed(6) + ":" + radius + ":" + this.m_name, {expires: 30});
    $('#dyn' + this.m_id + ' > .markerview .view_name').html(this.m_name);
    $('#dyn' + this.m_id + ' > .markerview .view_coordinates').html(Coordinates.toString(pos));
    $('#dyn' + this.m_id + ' > .markerview .view_circle').html(radius);
    $('#dyn' + this.m_id + ' > .markeredit .edit_name').val(this.m_name);
    $('#dyn' + this.m_id + ' > .markeredit .edit_coordinates').val(Coordinates.toString(pos));
    $('#dyn' + this.m_id + ' > .markeredit .edit_circle').val(radius);

    Lines.updateLinesMarkerMoved(this.m_id);
};
