/*jslint
  indent: 4
*/

/*global
  $,
  Conversion, Cookies, Coordinates, Lines, Marker,
  id2alpha, mytrans, showAlert, trackMarker
*/

var Markers = {};
Markers.m_map = null;
Markers.m_markers = null;


Markers.init = function (themap) {
    'use strict';

    this.m_map = themap;
    this.m_markers = new Array(26 * 10);

    var id;
    for (id = 0; id !== this.m_markers.length; id = id + 1) {
        this.m_markers[id] = new Marker(this, id);
    }
};


Markers.getSize = function () {
    'use strict';

    return this.m_markers.length;
};


Markers.isValid = function (id) {
    'use strict';

    return 0 <= id && id < this.m_markers.length;
};


Markers.getById = function (id) {
    'use strict';

    if (id < 0 || id >= this.m_markers.length) {
        return null;
    }

    return this.m_markers[id];
};


Markers.getUsedMarkers = function () {
    'use strict';

    var count = 0;
    this.m_markers.map(function (m) {
        if (!m.isFree()) {
            count = count + 1;
        }
    });
    return count;
};


Markers.getFreeMarkers = function () {
    'use strict';

    return this.getSize() - this.getUsedMarkers();
};


Markers.getFreeId = function () {
    'use strict';

    var id;
    for (id = 0; id < this.m_markers.length; id = id + 1) {
        if (this.m_markers[id].isFree()) {
            return id;
        }
    }
    return -1;
};


Markers.getNextUsedId = function (id) {
    'use strict';

    var i;
    for (i = id + 1; i < this.m_markers.length; i = i + 1) {
        if (!this.m_markers[i].isFree()) {
            return i;
        }
    }
    return -1;
};


Markers.removeById = function (id) {
    'use strict';

    if (id >= 0 && id < this.m_markers.length) {
        this.m_markers[id].clear();
    }
};


Markers.deleteAll = function () {
    'use strict';

    this.m_markers.map(
        function (m) {
            m.clear();
        }
    );
};


Markers.saveMarkersList = function () {
    'use strict';

    var ids = [];
    this.m_markers.map(
        function (m) {
            if (!m.isFree()) {
                ids.push(m.getId());
            }
        }
    );
    Cookies.set('markers', ids.join(":"), {expires: 30});
};


Markers.toString = function () {
    'use strict';

    var parts = [];
    this.m_markers.map(
        function (m) {
            if (!m.isFree()) {
                parts.push(m.toString());
            }
        }
    );
    return parts.join("*");
};


Markers.toXmlWpts = function () {
    'use strict';

    var id,
        data = '';

    for (id = 0; id < this.m_markers.length; id = id + 1) {
        if (this.m_markers[id].isFree()) {
            continue;
        }
        data += this.m_markers[id].toXmlWpt();
        data += '\n';
    }

    return data;
};


Markers.update = function () {
    'use strict';

    this.m_markers.map(
        function (m) {
            m.update();
        }
    );
};


Markers.handleMarkerCleared = function () {
    'use strict';

    if (this.getUsedMarkers() === 0) {
        $('#btnmarkers2').hide();
    }

    Lines.updateTotalDistance();
    this.saveMarkersList();
};


Markers.goto = function (id) {
    'use strict';

    trackMarker('goto');

    var m = this.getById(id);
    if (m) {
        this.m_map.setCenter(m.getPosition());
    }
};


Markers.center = function (id) {
    'use strict';

    trackMarker('center');

    var m = this.getById(id);
    if (m) {
        m.setPosition(this.m_map.getCenter());
    }
};


Markers.newMarker = function (coordinates, id, radius, name) {
    'use strict';

    radius = Math.max(radius, 0);

    if (id < 0 || id >= this.getSize() || !this.getById(id).isFree()) {
        id = this.getFreeId();
        if (id < 0) {
            showAlert(
                mytrans("dialog.error"),
                mytrans("dialog.toomanymarkers_error.content").replace(/%1/, Markers.getSize())
            );
            return null;
        }
    }

    var self = this,
        marker,
        div,
        nextid;

    if (!name) {
        name = id2alpha(id);
    }

    marker = this.getById(id);
    marker.initialize(this.m_map, name, coordinates, radius);
    div = this.createMarkerDiv(id);

    nextid = this.getNextUsedId(id);
    if (nextid < 0) {
        $('#dynMarkerDiv').append(div);
    } else {
        $(div).insertBefore('#dyn' + nextid);
    }

    $('#dyn' + id + ' > .edit').keydown(function (e) {
        if (e.which === 27) {
            self.leaveEditMode(id, false);
        } else if (e.which === 13) {
            self.leaveEditMode(id, true);
        }
    });

    $('#btnmarkers2').show();
    $('#btnmarkersdelete1').removeAttr('disabled');
    $('#btnmarkersdelete2').removeAttr('disabled');

    marker.update();
    this.saveMarkersList();
    Lines.updateLinesMarkerAdded();

    return marker;
};


Markers.createMarkerDiv = function (id) {
    'use strict';

    var iconw = 33,
        iconh = 37,
        offsetx = (id % 26) * iconw,
        offsety = Math.floor(id / 26) * iconh;

    return "<div id=\"dyn" + id + "\">" +
        "<table class=\"view\" style=\"width: 100%; vertical-align: middle;\">\n" +
        "    <tr>\n" +
        "        <td rowspan=\"3\" style=\"vertical-align: top\">\n" +
        "            <span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/markers.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
        "        </td>\n" +
        "        <td style=\"text-align: center\"><i class=\"fa fa-map-marker\"></i></td>\n" +
        "        <td class=\"name\" colspan=\"2\">marker</td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center\"><i class=\"fa fa-globe\"></i></td>\n" +
        "        <td class=\"coords\" colspan=\"2\">N 48° 00.123 E 007° 51.456</td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center\"><i class=\"fa fa-circle-o\"></i></td>\n" +
        "        <td class=\"radius\">16100 m</td>\n" +
        "        <td>\n" +
        "            <div class=\"btn-group\" style=\"padding-bottom: 2px; padding-top: 2px; float: right\">\n" +
        "            <button class=\"my-button btn btn-mini btn-warning\" data-i18n=\"[title]sidebar.markers.edit_marker\" type=\"button\"  onclick=\"Markers.enterEditMode(" + id + ");\"><i class=\"fa fa-edit\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-danger\" data-i18n=\"[title]sidebar.markers.delete_marker\" type=\"button\" onClick=\"Markers.removeById(" + id + ");\"><i class=\"fa fa-trash-o\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-info\" data-i18n=\"[title]sidebar.markers.move_to\" type=\"button\" onClick=\"Markers.goto(" + id + ");\"><i class=\"fa fa-search\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-warning\" data-i18n=\"[title]sidebar.markers.center\" type=\"button\" onClick=\"Markers.center(" + id + ");\"><i class=\"fa fa-crosshairs\"></i></button>\n" +
        "            <button class=\"my-button btn btn-mini btn-success\" data-i18n=\"[title]sidebar.markers.project\" type=\"button\" onClick=\"projectFromMarker(" + id + ");\"><i class=\"fa fa-location-arrow\"></i></button>\n" +
        "            </div>\n" +
        "        </td>\n" +
        "    </tr>\n" +
        "</table>\n" +
        "<table class=\"edit\" style=\"display: none; width: 100%; vertical-align: middle;\">\n" +
        "    <tr>\n" +
        "        <td rowspan=\"4\" style=\"vertical-align: top\"><span style=\"width:" + iconw + "px; height:" + iconh + "px; float: left; display: block; background-image: url(img/markers.png); background-repeat: no-repeat; background-position: -" + offsetx + "px -" + offsety + "px;\">&nbsp;</span>\n" +
        "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-map-marker\"></i></td>\n" +
        "        <td><input data-i18n=\"[title]sidebar.markers.name;[placeholder]sidebar.markers.name_placeholder\" class=\"name form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-globe\"></i></td>\n" +
        "        <td><input data-i18n=\"[title]sidebar.markers.coordinates;[placeholder]sidebar.markers.coordinates_placeholder\" class=\"coords form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td style=\"text-align: center; vertical-align: middle;\"><i class=\"icon-circle-blank\"></i></td>\n" +
        "        <td><input data-i18n=\"[title]sidebar.markers.radius;[placeholder]sidebar.markers.radius_placeholder\" class=\"radius form-control input-block-level\" type=\"text\" style=\"margin-bottom: 0px;\" value=\"n/a\" /></td>\n" +
        "    </tr>\n" +
        "    <tr>\n" +
        "        <td colspan=\"2\" style=\"text-align: right\">\n" +
        "            <button class=\"btn btn-small btn-primary\" type=\"button\" onclick=\"Markers.leaveEditMode(" + id + ", true);\" data-i18n=\"dialog.ok\">OK</button>\n" +
        "            <button class=\"btn btn-small\" type=\"button\" onclick=\"Markers.leaveEditMode(" + id + ", false);\" data-i18n=\"dialog.cancel\">CANCEL</button>\n" +
        "        </td>\n" +
        "    </tr>\n" +
        "</table>" +
        "</div>";
};


Markers.enterEditMode = function (id) {
    'use strict';

    trackMarker('edit');
    var m = this.getById(id);
    if (!m) {
        return;
    }

    $('#dyn' + id + ' > .edit .name').val(m.getName());
    $('#dyn' + id + ' > .edit .coords').val(Coordinates.toString(m.getPosition()));
    $('#dyn' + id + ' > .edit .radius').val(m.getRadius());

    $('#dyn' + id + ' > .view').hide();
    $('#dyn' + id + ' > .edit').show();
};


Markers.leaveEditMode = function (id, takenew) {
    'use strict';

    if (!takenew) {
        $('#dyn' + id + ' > .view').show();
        $('#dyn' + id + ' > .edit').hide();
        return;
    }

    var m = this.getById(id),
        name = $('#dyn' + id + ' > .edit .name').val(),
        s_coords = $('#dyn' + id + ' > .edit .coords').val(),
        s_radius = $('#dyn' + id + ' > .edit .radius').val(),
        coords = Coordinates.fromString(s_coords),
        radius = Conversion.getInteger(s_radius, 0, 100000000000),
        errors = [];

    name = name.replace(/[^a-zA-Z0-9-_]/g, "_");

    if (!coords) {
        errors.push(mytrans("sidebar.markers.error_badcoordinates").replace(/%1/, s_coords));
    }
    if (radius === null) {
        errors.push(mytrans("sidebar.markers.error_badradius").replace(/%1/, s_radius));
    }

    if (errors.length > 0) {
        showAlert(mytrans("dialog.error"), errors.join("<br /><br />"));
        return;
    }

    m.setNamePositionRadius(name, coords, radius);
    $('#dyn' + id + ' > .view').show();
    $('#dyn' + id + ' > .edit').hide();
};
