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
    this.m_iconLabel = "";
    this.m_marker = null;
    this.m_circle = null;
}


Marker.prototype.toString = function () {
    'use strict';

    return this.getAlpha() + ":" + this.getPosition().lat().toFixed(6) + ":" + this.getPosition().lng().toFixed(6) + ":" + this.getRadius() + ":" + this.getName();
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


function getTextWidth(text, font) {
    'use strict';

    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas")),
        context = canvas.getContext("2d");
    context.font = font;

    return context.measureText(text).width;
}


Marker.prototype.createSvgIcon = function () {
    'use strict';

    var w        = 24.0 + getTextWidth(this.m_name, "16px roboto"),
        w2       = 0.5 * w,
        color    = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFFFFF"][this.m_id % 7],
        txtcolor = ["#FFFFFF", "#000000", "#FFFFFF", "#000000", "#000000", "#000000", "#000000"][this.m_id % 7],
        url      = 'data:image/svg+xml;utf-8, \
<svg \
   xmlns:svg="http://www.w3.org/2000/svg" \
   xmlns="http://www.w3.org/2000/svg" \
   width="' + w + '" height="37" \
   viewBox="0 0 ' + w + ' 37" \
   version="1.1"> \
   <defs> \
    <filter id="shadow" x="0" y="0" width="200%" height="200%"> \
      <feOffset result="offOut" in="SourceAlpha" dx="2" dy="2" /> \
      <feGaussianBlur result="blurOut" in="offOut" stdDeviation="4" /> \
      <feBlend in="SourceGraphic" in2="blurOut" mode="normal" /> \
    </filter> \
  </defs> \
    <path \
       fill="' + color + '" stroke="#000000" \
       d="M 4 4 L 4 26 L ' + (w2 - 4.0) + ' 26 L ' + (w2) + ' 33 L ' + (w2 + 4.0) + ' 26 L ' + (w - 4.0) + ' 26 L ' + (w - 4.0) + ' 4 L 4 4 z" \
       filter="url(#shadow)" /> \
    <text \
       style="text-anchor:middle;font-style:normal;font-weight:normal;font-size:16px;line-height:100%;font-family:Roboto;letter-spacing:0px;word-spacing:0px;fill:' + txtcolor + ';fill-opacity:1;stroke:none;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" \
       x="' + (w2) + '" y="21">' + this.m_name + '</text> \
</svg>';

    return {
        url: url, 
        size: new google.maps.Size(w, 37),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(w2, 37 - 1.0)};
};


Marker.prototype.initialize = function (map, name, position, radius) {
    'use strict';

    this.m_free = false;
    this.m_name = name;
    this.m_iconLabel = name;

    // marker.png is 26x10 icons (each: 33px x 37px)
    var self = this,
        iconw = 33,
        iconh = 37,
        offsetx = (this.m_id % 26) * iconw,
        offsety = Math.floor(this.m_id / 26) * iconh,
        color = "#0090ff",
        icon = this.createSvgIcon(this.m_name);

    this.m_marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: icon,
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
    $('#dyn' + this.m_id + ' > .view .name').html(this.m_name);
    $('#dyn' + this.m_id + ' > .view .coords').html(Coordinates.toString(pos));
    $('#dyn' + this.m_id + ' > .view .radius').html(radius);
    $('#dyn' + this.m_id + ' > .edit .name').val(this.m_name);
    $('#dyn' + this.m_id + ' > .edit .coords').val(Coordinates.toString(pos));
    $('#dyn' + this.m_id + ' > .edit .radius').val(radius);

    if (this.m_iconLabel != this.m_name) {
        this.m_iconLabel = this.m_name;
        this.m_marker.setIcon(this.createSvgIcon());
    }
    Lines.updateLinesMarkerMoved(this.m_id);
};
