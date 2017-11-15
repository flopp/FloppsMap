/*jslint
  regexp: true
*/

/*global
  $, google,
  Coordinates, Markers, TxtOverlay,
  id2alpha
*/

function Line(themap, id, source, target) {
    'use strict';

    this.m_map = themap;
    this.m_id = id;
    this.m_lineMapObject = null;
    this.m_source = -1;
    this.m_target = -1;
    this.m_distanceLabel = null;
    this.m_distance = -1;

    $('#dynLineDiv').append("<div id=\"dynline" + id + "\">" +
            "    <table style=\"width: 100%\">" +
            "        <tr>" +
            "            <td>1:</td>" +
            "            <td>" +
            "                <select class=\"source my-small-select\" data-i18n=\"[title]sidebar.lines.source\" onchange=\"Lines.selectLineSource(" + id + ");\"><option value=\"-1\">?</option></select>" +
            "            </td>" +
            "            <td rowspan=\"2\" style=\"vertical-align: top;\">" +
            "                <button class=\"my-button btn btn-mini btn-danger\" style=\"float: right\" data-i18n=\"[title]sidebar.lines.delete_line\" type=\"button\" onClick=\"trackLine('delete'); Lines.deleteLine(" + id + ");\"><i class=\"fa fa-trash-o\"></i></button>" +
            "            </td>" +
            "        </tr>" +
            "        <tr>" +
            "            <td>2:</td>" +
            "            <td>" +
            "                <select class=\"target my-small-select\" data-i18n=\"[title]sidebar.lines.destination\" onchange=\"Lines.selectLineTarget(" + id + ");\"><option value=\"-1\">?</option></select>" +
            "            </td>" +
            "        </tr>" +
            "        <tr>" +
            "            <td colspan=\"3\">" +
            "                <i class=\"fa fa-arrows-h\"></i> <span class=\"dist\">n/a</span> <i class=\"fa fa-compass\"></i> <span class=\"angle\">n/a</span>" +
            "            </td>" +
            "        </tr>" +
            "    </table>" +
            "</div>");

    this.updateLists();
    this.setSource(source);
    this.setTarget(target);
}


Line.prototype.m_map = null;
Line.prototype.m_id = -1;
Line.prototype.m_lineMapObject = null;
Line.prototype.m_source = -1;
Line.prototype.m_target = -1;
Line.prototype.m_distanceLabel = null;
Line.prototype.m_distance = -1;

Line.prototype.getId = function () {
    'use strict';

    return this.m_id;
};


Line.prototype.clearMapObject = function () {
    'use strict';

    if (this.m_lineMapObject) {
        this.m_lineMapObject.setMap(null);
        this.m_lineMapObject = null;
    }

    if (this.m_distanceLabel) {
        this.m_distanceLabel.setMap(null);
        this.m_distanceLabel = null;
    }
};


Line.prototype.updateMapObject = function (pos1, pos2, center) {
    'use strict';

    if (!this.m_lineMapObject) {
        this.m_lineMapObject = new google.maps.Polyline({
            strokeColor: '#ff0000',
            strokeWeight: 2,
            strokeOpacity: 0.7,
            geodesic: true,
            icons: [{
                icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
                },
                repeat: '0'
            }]
        });
        this.m_lineMapObject.setMap(this.m_map);
        this.m_distanceLabel = new TxtOverlay(center, "n/a", "mapDistanceLabel", this.m_map);
    }

    var path = new google.maps.MVCArray();
    path.push(pos1);
    path.push(pos2);
    this.m_lineMapObject.setPath(path);

    this.m_distanceLabel.setPos(center);
};


Line.prototype.getEndpointsString = function () {
    'use strict';

    return id2alpha(this.m_source) + ":" + id2alpha(this.m_target);
};


Line.prototype.setSource = function (markerId) {
    'use strict';

    if (markerId !== this.m_source) {
        this.m_source = markerId;
        this.update();
        $("#dynline" + this.m_id + " .source > option[value=" + markerId + "]").attr("selected", "selected");
    }
};


Line.prototype.setTarget = function (markerId) {
    'use strict';

    if (markerId !== this.m_target) {
        this.m_target = markerId;
        this.update();
        $("#dynline" + this.m_id + " .target > option[value=" + markerId + "]").attr("selected", "selected");
    }
};


Line.prototype.update = function () {
    'use strict';

    if (this.m_source === -1 || this.m_target === -1) {
        this.clearMapObject();
        this.m_distance = -1;

        $("#dynline" + this.m_id + " .dist").html("n/a");
        $("#dynline" + this.m_id + " .angle").html("n/a");

        return;
    }

    var pos1 = Markers.getById(this.m_source).getPosition(),
        pos2 = Markers.getById(this.m_target).getPosition(),
        dist_angle = Coordinates.dist_angle_geodesic(pos1, pos2),
        centerPos = Coordinates.projection_geodesic(pos1, dist_angle.angle, 0.5 * dist_angle.dist);

    this.updateMapObject(pos1, pos2, centerPos);
    this.m_distance = dist_angle.dist;

    if (dist_angle.dist <= 0) {
        this.m_distanceLabel.setText("");
        $("#dynline" + this.m_id + " .dist").html("0m");
        $("#dynline" + this.m_id + " .angle").html("n/a");
    } else {
        this.m_distanceLabel.setText(dist_angle.dist.toFixed() + "m");
        $("#dynline" + this.m_id + " .dist").html(dist_angle.dist.toFixed() + "m");
        $("#dynline" + this.m_id + " .angle").html(dist_angle.angle.toFixed(1) + "°");
    }
};


Line.prototype.updateMarkerMoved = function (markerId) {
    'use strict';

    if (this.m_source === markerId || this.m_target === markerId) {
        this.update();
    }
};


Line.prototype.updateMarkerRemoved = function (markerId) {
    'use strict';

    if (this.m_source === markerId) {
        this.m_source = -1;
        this.clearMapObject();
    }

    if (this.m_target === markerId) {
        this.m_target = -1;
        this.clearMapObject();
    }

    this.updateLists();
};


Line.prototype.updateMarkerAdded = function () {
    'use strict';

    this.updateLists();
};


Line.prototype.updateLists = function () {
    'use strict';

    var source = $("#dynline" + this.m_id + " .source"),
        target = $("#dynline" + this.m_id + " .target"),
        i,
        m;

    source.empty();
    target.empty();

    source.append('<option value="-1">?</option>');
    target.append('<option value="-1">?</option>');

    for (i = 0; i < Markers.getSize(); i = i + 1) {
        m = Markers.getById(i);
        if (!m.isFree()) {
            source.append('<option value="' + i + '">' + m.getAlpha() + ': ' + m.getName() + '</option>');
            target.append('<option value="' + i + '">' + m.getAlpha() + ': ' + m.getName() + '</option>');
        }
    }

    $("#dynline" + this.m_id + " .source > option[value=" + this.m_source + "]").attr("selected", "selected");
    $("#dynline" + this.m_id + " .target > option[value=" + this.m_target + "]").attr("selected", "selected");

    this.update();
};


Line.prototype.distance = function () {
    'use strict';

    return this.m_distance;
};
