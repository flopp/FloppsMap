function TxtOverlay(pos, txt, cls, map) {
    this.pos = pos;
    this.txt_ = txt;
    this.cls_ = cls;
    this.map_ = map;
    this.div_ = null;
    this.setMap(map);
}

TxtOverlay.prototype = new google.maps.OverlayView();

TxtOverlay.prototype.updatePos = function() {
    if (this.div_) {
        var overlayProjection = this.getProjection();
        var pixelPos = overlayProjection.fromLatLngToDivPixel(this.pos);
        this.div_.style.left = pixelPos.x + 'px';
        this.div_.style.top = pixelPos.y + 'px';
    }
}

TxtOverlay.prototype.updateText = function() {
    if (this.div_) {
        this.div_.innerHTML = this.txt_;
    }
}

TxtOverlay.prototype.onAdd = function() {
    this.div_ = document.createElement('DIV');
    this.div_.style.position = "absolute";
    this.div_.style.transform = "translate(-50%,-50%)";
    this.div_.className = this.cls_;

    this.updatePos();
    this.updateText();

    var panes = this.getPanes();
    panes.floatPane.appendChild(this.div_);
}

TxtOverlay.prototype.setText = function(text) {
    this.txt_ = text;
    this.updateText();
}

TxtOverlay.prototype.setPos = function(pos) {
    this.pos = pos;
    this.updatePos();
}

TxtOverlay.prototype.draw = function() {
    this.updatePos();
}

TxtOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
}

TxtOverlay.prototype.hide = function() {
    if (this.div_) {
        this.div_.style.visibility = "hidden";
    }
}

TxtOverlay.prototype.show = function() {
    if (this.div_) {
        this.div_.style.visibility = "visible";
    }
}

TxtOverlay.prototype.toggle = function() {
    if (this.div_) {
        if (this.div_.style.visibility == "hidden") {
            this.show();
        }
        else {
            this.hide();
        }
    }
}

function Line(id, source, target) {
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
    "<select id=\"dynlinesource" + id + "\" class=\"my-small-select\" data-i18n=\"[title]sidebar.lines.source\" onchange=\"theLines.selectLineSource("+id+")\"><option value=\"-1\">?</option></select>" +
    "&nbsp;&rarr;&nbsp;" +
    "<select id=\"dynlinetarget" + id + "\" class=\"my-small-select\" data-i18n=\"[title]sidebar.lines.destination\" onchange=\"theLines.selectLineTarget("+id+")\"><option value=\"-1\">?</option></select>" +
    "</td>" +
    "<td>" +
    "<button class=\"my-button btn btn-mini btn-danger\" style=\"float: right\" data-i18n=\"[title]sidebar.lines.delete_line\" type=\"button\" onClick=\"trackLine('delete'); theLines.deleteLine(" + id + ")\"><i class=\"fa fa-trash-o\"></i></button>" +
    "<div>" +
    "</div>" +
    "</td>" +
    "</tr>" +
    "<tr><td colspan=\"2\"><i class=\"fa fa-arrows-h\"></i> <span id=\"dynlinedist" + id + "\">n/a</span> <i class=\"fa fa-compass\"></i> <span id=\"dynlineangle" + id + "\">n/a</span></td></tr>" +
    "</table>" +
    "</div>"
  );

  var i;
  for (i = 0; i < theMarkers.getSize(); i = i + 1) {
    if (!theMarkers.getById(i).isFree()) {
      this.updateMarkerAdded(i);
    }
  }

  this.setSource(source);
  this.setTarget(target);
}

Line.prototype.m_id = -1;
Line.prototype.m_lineMapObject = null;
Line.prototype.m_source = -1;
Line.prototype.m_target = -1;
Line.prototype.m_distanceLabel = null;

Line.prototype.getId = function() {
  return this.m_id;
}

Line.prototype.clearMapObject = function() {
  if (this.m_lineMapObject) {
    this.m_lineMapObject.setMap(null);
    this.m_lineMapObject = null;
  }

  if (this.m_distanceLabel) {
      this.m_distanceLabel.setMap(null);
      this.m_distanceLabel = null;
  }
}

Line.prototype.getEndpointsString = function() {
  return id2alpha(this.m_source) + ":" + id2alpha(this.m_target);
}


Line.prototype.setSource = function(markerId) {
  if (markerId != this.m_source)
  {
    this.m_source = markerId;
    this.update();
    $("#dynlinesource" + this.m_id + " > option[value=" + markerId + "]").attr("selected", "selected");
  }
}

Line.prototype.setTarget = function(markerId) {
  if (markerId != this.m_target) {
    this.m_target = markerId;
    this.update();
    $("#dynlinetarget" + this.m_id + " > option[value=" + markerId + "]").attr("selected", "selected");
  }
}

Line.prototype.update = function() {
  if (this.m_source == -1 || this.m_target == -1) {
    this.clearMapObject();

    $("#dynlinedist" + this.m_id).html( "n/a" );
    $("#dynlineangle" + this.m_id).html( "n/a" );
  }
  else {
    var pos1 = theMarkers.getById(this.m_source).getPosition();
    var pos2 = theMarkers.getById(this.m_target).getPosition();

    if (this.m_lineMapObject === null) {
      this.m_lineMapObject = new google.maps.Polyline( {
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
      } );
      this.m_lineMapObject.setMap( map );

      this.m_distanceLabel = new TxtOverlay(pos2, "hallo", "mapDistanceLabel", map);
    }

    var path = new google.maps.MVCArray;
    path.push(pos1);
    path.push(pos2);
    this.m_lineMapObject.setPath(path);

    var dist_angle = { dist: 0, angle: 0 };
    if (this.m_source != this.m_target) {
      dist_angle = Coordinates.dist_angle_geodesic(pos1, pos2);
    }

    var centerPos = Coordinates.projection_geodesic(pos1, dist_angle.angle, 0.5 * dist_angle.dist);
    this.m_distanceLabel.setPos(centerPos);
    this.m_distanceLabel.setText(dist_angle.dist.toFixed() + "m");

    if (dist_angle.dist == 0) {
      $("#dynlinedist" + this.m_id).html("0m");
      $("#dynlineangle" + this.m_id).html("n/a");
    } else {
      $("#dynlinedist" + this.m_id).html(dist_angle.dist.toFixed() + "m");
      $("#dynlineangle" + this.m_id).html(dist_angle.angle.toFixed(1) + "°");
    }
  }
}

Line.prototype.updateMarkerMoved = function(markerId) {
  if (this.m_source == markerId || this.m_target == markerId) {
    this.update();
  }
}

Line.prototype.updateMarkerRemoved = function(markerId) {
  if (this.m_source == markerId ) {
    this.m_source = -1;
    this.clearMapObject();
  }

  if( this.m_target == markerId ) {
    this.m_target = -1;
    this.clearMapObject();
  }

  var source = $('#dynlinesource' + this.m_id);
  var target = $('#dynlinetarget' + this.m_id);

  source.empty();
  target.empty();

  source.append('<option value="-1">?</option>');
  target.append('<option value="-1">?</option>');

  var i;
  for (i = 0; i < theMarkers.getSize(); i = i + 1) {
    var m = theMarkers.getById(i);
    if (!m.isFree()) {
      source.append('<option value="'+i+'">'+m.getAlpha()+'</option>');
      target.append('<option value="'+i+'">'+m.getAlpha()+'</option>');
    }
  }

  $("#dynlinesource" + this.m_id + " > option[value=" + this.m_source + "]").attr("selected", "selected");
  $("#dynlinetarget" + this.m_id + " > option[value=" + this.m_target + "]").attr("selected", "selected");
}


Line.prototype.updateMarkerAdded = function(markerId) {
  var source = $('#dynlinesource' + this.m_id);
  var target = $('#dynlinetarget' + this.m_id);

  source.empty();
  target.empty();

  source.append('<option value="-1">?</option>');
  target.append('<option value="-1">?</option>');

  var i;
  for (i = 0; i < theMarkers.getSize(); i = i + 1) {
    var m = theMarkers.getById(i);
    if (!m.isFree()) {
      source.append('<option value="'+i+'">'+m.getAlpha()+'</option>');
      target.append('<option value="'+i+'">'+m.getAlpha()+'</option>');
    }
  }

  $("#dynlinesource" + this.m_id + " > option[value=" + this.m_source + "]").attr("selected", "selected");
  $("#dynlinetarget" + this.m_id + " > option[value=" + this.m_target + "]").attr("selected", "selected");
}


function Lines() {
  this.m_nextLineId = 0;
  this.m_lines = new Array();
}

Lines.prototype.m_nextLineId = 0;
Lines.prototype.m_lines = null;

Lines.prototype.newLine = function(source, target) {
  this.m_lines.push(new Line(this.m_nextLineId++, source, target));
  this.saveCookie();
}

Lines.prototype.getLineIndex = function(id) {
  for (var index = 0; index < this.m_lines.length; ++index) {
    var line = this.m_lines[index];
    if (line == null) continue;

    if (line.getId() == id) {
      return index;
    }
  }

  return -1;
}

Lines.prototype.getLineById = function(id) {
  var index = this.getLineIndex(id);
  if (index == -1) return null;

  return this.m_lines[index];
}


Lines.prototype.getLinesText = function(){
  var a = Array();
  this.m_lines.map(function (line) { if (line) { a.push(line.getEndpointsString()); }});
  return a.join("*");
}

Lines.prototype.saveCookie = function() {
  Cookies.set("lines", this.getLinesText(), {expires: 30});
}

Lines.prototype.selectLineSourceById = function(id, markerId) {
  this.getLineById(id).setSource(markerId);
  this.saveCookie();
}

Lines.prototype.selectLineSource = function( id ) {
  var markerId = -1;
  var opt = $("#dynlinesource" + id +" option:selected");
  if( opt ) {
    markerId = parseInt( opt.val() );
  }

  this.selectLineSourceById( id, markerId );
}


Lines.prototype.selectLineTargetById = function (id, markerId) {
  this.getLineById(id).setTarget(markerId);
  this.saveCookie();
};

Lines.prototype.selectLineTarget = function (id) {
  var markerId = -1;
  var opt = $("#dynlinetarget" + id +" option:selected");
  if( opt ) {
    markerId = parseInt( opt.val() );
  }

  this.selectLineTargetById( id, markerId );
}

Lines.prototype.updateLinesMarkerMoved = function (markerId) {
  this.m_lines.map(function (line) { if (line) { line.updateMarkerMoved(markerId); }});
}

Lines.prototype.updateLinesMarkerAdded = function (markerId) {
  this.m_lines.map(function (line) { if (line) { line.updateMarkerAdded(markerId); }});
}

Lines.prototype.updateLinesMarkerRemoved = function(markerId) {
  this.m_lines.map(function (line) { if (line) { line.updateMarkerRemoved(markerId); }});
  this.saveCookie();
}

Lines.prototype.updateLine = function( id ) {
  var index = this.getLineIndex( id );
  if (index == -1) return;
  this.m_lines[index].update();
}

Lines.prototype.deleteLine = function( id ) {
  $('#dynLine' + id).remove();

  var index = this.getLineIndex( id );
  if (index == -1 || this.m_lines[index] == null) return;

  this.m_lines[index].clearMapObject();
  this.m_lines[index] = null;

  this.saveCookie();
}

Lines.prototype.deleteAllLines = function() {
  var self = this;
  this.m_lines.map(function (line) { if (line) { self.deleteLine(line.getId()); }});
}
