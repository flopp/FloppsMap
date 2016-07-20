/*jslint
  regexp: true
  indent: 4
*/

/*global
  $, google, theMarkers, id2alpha, Cookies, Coordinates, TxtOverlay
*/

function Line(themap, id, source, target) {
    'use strict';

    this.m_map = themap;
    this.m_id = id;
    this.m_lineMapObject = null;
    this.m_source = -1;
    this.m_target = -1;
    this.m_distanceLabel = null;

    $('#dynLineDiv').append(
        "<div id=\"dynLine" + id + "\">" +
            "<table style=\"width: 100%\">" +
            "<tr>" +
            "<td>" +
            "<select id=\"dynlinesource" + id + "\" class=\"my-small-select\" data-i18n=\"[title]sidebar.lines.source\" onchange=\"Lines.selectLineSource(" + id + ")\"><option value=\"-1\">?</option></select>" +
            "&nbsp;&rarr;&nbsp;" +
            "<select id=\"dynlinetarget" + id + "\" class=\"my-small-select\" data-i18n=\"[title]sidebar.lines.destination\" onchange=\"Lines.selectLineTarget(" + id + ")\"><option value=\"-1\">?</option></select>" +
            "</td>" +
            "<td>" +
            "<button class=\"my-button btn btn-mini btn-danger\" style=\"float: right\" data-i18n=\"[title]sidebar.lines.delete_line\" type=\"button\" onClick=\"trackLine('delete'); Lines.deleteLine(" + id + ")\"><i class=\"fa fa-trash-o\"></i></button>" +
            "<div>" +
            "</div>" +
            "</td>" +
            "</tr>" +
            "<tr><td colspan=\"2\"><i class=\"fa fa-arrows-h\"></i> <span id=\"dynlinedist" + id + "\">n/a</span> <i class=\"fa fa-compass\"></i> <span id=\"dynlineangle" + id + "\">n/a</span></td></tr>" +
            "</table>" +
            "</div>"
    );

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


Line.prototype.getEndpointsString = function () {
    'use strict';

    return id2alpha(this.m_source) + ":" + id2alpha(this.m_target);
};


Line.prototype.setSource = function (markerId) {
    'use strict';

    if (markerId !== this.m_source) {
        this.m_source = markerId;
        this.update();
        $("#dynlinesource" + this.m_id + " > option[value=" + markerId + "]").attr("selected", "selected");
    }
};


Line.prototype.setTarget = function (markerId) {
    'use strict';

    if (markerId !== this.m_target) {
        this.m_target = markerId;
        this.update();
        $("#dynlinetarget" + this.m_id + " > option[value=" + markerId + "]").attr("selected", "selected");
    }
};


Line.prototype.update = function () {
    'use strict';

    if (this.m_source === -1 || this.m_target === -1) {
        this.clearMapObject();

        $("#dynlinedist" + this.m_id).html("n/a");
        $("#dynlineangle" + this.m_id).html("n/a");

        return;
    }

    var pos1 = theMarkers.getById(this.m_source).getPosition(),
        pos2 = theMarkers.getById(this.m_target).getPosition(),
        path = new google.maps.MVCArray(),
        dist_angle = { dist: 0, angle: 0 },
        centerPos;

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
        this.m_distanceLabel = new TxtOverlay(pos2, "n/a", "mapDistanceLabel", this.m_map);
    }

    path.push(pos1);
    path.push(pos2);
    this.m_lineMapObject.setPath(path);
    if (this.m_source !== this.m_target) {
        dist_angle = Coordinates.dist_angle_geodesic(pos1, pos2);
    }

    centerPos = Coordinates.projection_geodesic(pos1, dist_angle.angle, 0.5 * dist_angle.dist);
    this.m_distanceLabel.setPos(centerPos);
    this.m_distanceLabel.setText(dist_angle.dist.toFixed() + "m");

    if (dist_angle.dist <= 0) {
        $("#dynlinedist" + this.m_id).html("0m");
        $("#dynlineangle" + this.m_id).html("n/a");
    } else {
        $("#dynlinedist" + this.m_id).html(dist_angle.dist.toFixed() + "m");
        $("#dynlineangle" + this.m_id).html(dist_angle.angle.toFixed(1) + "°");
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

    var source = $('#dynlinesource' + this.m_id),
        target = $('#dynlinetarget' + this.m_id),
        i,
        m;

    source.empty();
    target.empty();

    source.append('<option value="-1">?</option>');
    target.append('<option value="-1">?</option>');

    for (i = 0; i < theMarkers.getSize(); i = i + 1) {
        m = theMarkers.getById(i);
        if (!m.isFree()) {
            source.append('<option value="' + i + '">' + m.getAlpha() + '</option>');
            target.append('<option value="' + i + '">' + m.getAlpha() + '</option>');
        }
    }

    $("#dynlinesource" + this.m_id + " > option[value=" + this.m_source + "]").attr("selected", "selected");
    $("#dynlinetarget" + this.m_id + " > option[value=" + this.m_target + "]").attr("selected", "selected");
};


var Lines = {};
Lines.m_map = null;
Lines.m_nextLineId = 0;
Lines.m_lines = [];


Lines.init = function (themap) {
    'use strict';

    Lines.m_map = themap;
    Lines.m_nextLineId = 0;
    Lines.m_lines = [];
};


Lines.newLine = function (source, target) {
    'use strict';

    this.m_lines.push(new Line(Lines.m_map, this.m_nextLineId, source, target));
    this.m_nextLineId += 1;
    this.saveCookie();
};


Lines.getLineIndex = function (id) {
    'use strict';

    var index, line;

    for (index = 0; index < this.m_lines.length; index += 1) {
        line = this.m_lines[index];
        if (line && line.getId() === id) {
            return index;
        }
    }

    return -1;
};


Lines.getLineById = function (id) {
    'use strict';

    var index = this.getLineIndex(id);
    if (index < 0) {
        return null;
    }
    return this.m_lines[index];
};


Lines.getLinesText = function () {
    'use strict';

    var a = [];
    this.m_lines.map(function (line) {
        if (line) {
            a.push(line.getEndpointsString());
        }
    });
    return a.join("*");
};


Lines.saveCookie = function () {
    'use strict';

    Cookies.set("lines", this.getLinesText(), {expires: 30});
};


Lines.selectLineSourceById = function (id, markerId) {
    'use strict';

    this.getLineById(id).setSource(markerId);
    this.saveCookie();
};


Lines.selectLineSource = function (id) {
    'use strict';

    var markerId = -1,
        opt = $("#dynlinesource" + id + " option:selected");

    if (opt) {
        markerId = parseInt(opt.val(), 10);
    }

    this.selectLineSourceById(id, markerId);
};


Lines.selectLineTargetById = function (id, markerId) {
    'use strict';

    this.getLineById(id).setTarget(markerId);
    this.saveCookie();
};


Lines.selectLineTarget = function (id) {
    'use strict';

    var markerId = -1,
        opt = $("#dynlinetarget" + id + " option:selected");

    if (opt) {
        markerId = parseInt(opt.val(), 10);
    }

    this.selectLineTargetById(id, markerId);
};


Lines.updateLinesMarkerMoved = function (markerId) {
    'use strict';

    this.m_lines.map(function (line) {
        if (line) {
            line.updateMarkerMoved(markerId);
        }
    });
};


Lines.updateLinesMarkerAdded = function () {
    'use strict';

    this.m_lines.map(function (line) {
        if (line) {
            line.updateMarkerAdded();
        }
    });
};


Lines.updateLinesMarkerRemoved = function (markerId) {
    'use strict';

    this.m_lines.map(function (line) {
        if (line) {
            line.updateMarkerRemoved(markerId);
        }
    });
    this.saveCookie();
};


Lines.updateLine = function (id) {
    'use strict';

    var index = this.getLineIndex(id);
    if (index < 0) {
        return;
    }

    this.m_lines[index].update();
};


Lines.deleteLine = function (id) {
    'use strict';

    $('#dynLine' + id).remove();

    var index = this.getLineIndex(id);
    if (index < 0 || !this.m_lines[index]) {
        return;
    }

    this.m_lines[index].clearMapObject();
    this.m_lines[index] = null;

    this.saveCookie();
};


Lines.deleteAllLines = function () {
    'use strict';

    var self = this;
    this.m_lines.map(function (line) {
        if (line) {
            self.deleteLine(line.getId());
        }
    });
};
