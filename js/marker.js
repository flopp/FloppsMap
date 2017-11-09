/*jslint
  indent: 4
*/

/*global
  $, google,
  Cookies, Coordinates, IconFactory, Lines,
  id2alpha
*/

function Marker(parent, id) {
    'use strict';

    this.m_parent = parent;
    this.m_id = id;
    this.m_alpha = id2alpha(id);
    this.m_free = true;
    this.m_name = "";
    this.m_color = "FF0000";
    this.m_iconColor = "";
    this.m_iconLabel = "";
    this.m_miniIconUrl = "";
    this.m_marker = null;
    this.m_circle = null;
}


Marker.prototype.toString = function () {
    'use strict';

    return this.getAlpha() + ":" +
            this.getPosition().lat().toFixed(6) + ":" +
            this.getPosition().lng().toFixed(6) + ":" +
            this.getRadius() + ":" +
            this.getName() + ":" +
            this.m_color;
};


Marker.prototype.toXmlWpt = function () {
    'use strict';

    var data = '';
    data += '<wpt lat="' + this.getPosition().lat().toFixed(8) + '" lon="' + this.getPosition().lng().toFixed(8) + '">\n';
    data += '    <name>' + this.getName() + '</name>\n';
    data += '    <sym>flag</sym>\n';
    if (this.getRadius() > 0) {
        data += '    <extensions>\n';
        data += '      <wptx1:WaypointExtension>\n';
        data += '        <wptx1:Proximity>' + this.getRadius() + '</wptx1:Proximity>\n';
        data += '      </wptx1:WaypointExtension>\n';
        data += '    </extensions>\n';
    }
    data += '</wpt>';

    return data;
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
    this.m_color = "FF0000";
    this.m_iconColor = "";
    this.m_iconLabel = "";

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


Marker.prototype.setNamePositionRadiusColor = function (name, position, radius, color) {
    'use strict';

    this.m_name = name;
    this.m_marker.setPosition(position);
    this.m_circle.setCenter(position);
    this.m_circle.setRadius(radius);
    this.m_color = color;
    this.update();
};


Marker.prototype.initialize = function (map, name, position, radius, color) {
    'use strict';

    this.m_free = false;
    this.m_name = name;
    this.m_color = color;
    if (!((/^([a-fA-F0-9]{6})$/).test(this.m_color))) {
        var colors = ["FF0000", "00FF00", "0000FF", "FFFF00", "FF00FF", "00FFFF", "FFFFFF"];
        this.m_color = colors[this.m_id % 7];
    }
    this.m_iconLabel = name;
    this.m_iconColor = this.m_color;

    var self = this;

    this.m_miniIcon = IconFactory.createMiniIcon(this.m_alpha, this.m_color);

    this.m_marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: IconFactory.createMapIcon(this.m_name, this.m_color),
        optimized: false,
        draggable: true
    });

    google.maps.event.addListener(this.m_marker, "drag", function () {
        self.update();
    });
    google.maps.event.addListener(this.m_marker, "dragend", function () {
        self.update();
    });

    this.m_circle = new google.maps.Circle({
        center: position,
        map: map,
        strokeColor: "#" + this.m_color,
        strokeOpacity: 1,
        fillColor: "#" + this.m_color,
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

    Cookies.set('marker' + this.m_id, pos.lat().toFixed(6) + ":" + pos.lng().toFixed(6) + ":" + radius + ":" + this.m_name + ":" + this.m_color, {expires: 30});
    $('#dyn' + this.m_id + ' > .view .name').html(this.m_name);
    $('#dyn' + this.m_id + ' > .view .coords').html(Coordinates.toString(pos));
    $('#dyn' + this.m_id + ' > .view .radius').html(radius);
    $('#dyn' + this.m_id + ' > .edit .name').val(this.m_name);
    $('#dyn' + this.m_id + ' > .edit .coords').val(Coordinates.toString(pos));
    $('#dyn' + this.m_id + ' > .edit .radius').val(radius);
    $('#dyn' + this.m_id + ' > .edit .color').val(this.m_color);

    if ((this.m_iconLabel !== this.m_name) || (this.m_iconColor !== this.m_color)) {
        this.m_iconLabel = this.m_name;
        this.m_iconColor = this.m_color;
        this.m_marker.setIcon(IconFactory.createMapIcon(this.m_name, this.m_color));
        this.m_miniIcon = IconFactory.createMiniIcon(this.m_alpha, this.m_color);
        this.m_circle.setOptions({strokeColor: "#" + this.m_color, fillColor: "#" + this.m_color});
    }
    $('#dyn' + this.m_id + ' > .view .icon').attr("src", this.m_miniIcon.url);
    $('#dyn' + this.m_id + ' > .view .icon').attr("style", "width: " + this.m_miniIcon.width + "px; height: " + this.m_miniIcon.height + "px;");

    Lines.updateLinesMarkerMoved(this.m_id);
};
