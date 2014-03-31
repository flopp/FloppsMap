function Line(id, source, target) {
  this.m_id = id;
  this.m_lineMapObject = null;
  this.m_source = -1;
  this.m_target = -1;
  
  $('#dynLineDiv').append( 
  "<div id=\"dynLine" + id + "\">" +
  "<table style=\"width: 100%\">" +
  "<tr>" +
  "<td>" +
  "<select id=\"dynlinesource" + id + "\" class=\"my-small-select\" title=\"" + TT("Source", "Quelle") + "\" onchange=\"theLines.selectLineSource("+id+")\"><option value=\"-1\">?</option></select>" +
  "&nbsp;&rarr;&nbsp;" +
  "<select id=\"dynlinetarget" + id + "\" class=\"my-small-select\" title=\"" + TT("Target", "Ziel") + "\" onchange=\"theLines.selectLineTarget("+id+")\"><option value=\"-1\">?</option></select>" +
  "</td>" +
  "<td>" +
  "<button class=\"my-button btn btn-mini btn-danger\" style=\"float: right\" title=\"" + TT("Delete line", "Lösche Linie") + "\" type=\"button\" onClick=\"trackLine('delete'); theLines.deleteLine(" + id + ")\"><i class=\"fa fa-trash-o\"></i></button>" +
  "<div>" +
  "</div>" +
  "</td>" +
  "</tr>" +
  "<tr><td colspan=\"2\"><i class=\"fa fa-arrows-h\"></i> <span id=\"dynlinedist" + id + "\">n/a</span> <i class=\"fa fa-compass\"></i> <span id=\"dynlineangle" + id + "\">n/a</span></td></tr>" +
  "</table>" +
  "</div>"
  );
  
  for (var i = 0; i < markers.length; ++i)
  {
    if (!markers[i].free)
    {
      this.updateMarkerAdded(markers[i].id);
    }
  }
  
  this.setSource(source);
  this.setTarget(target);
}

Line.prototype.m_id = -1;
Line.prototype.m_lineMapObject = null;
Line.prototype.m_source = -1;
Line.prototype.m_target = -1;

Line.prototype.getId = function() {
  return this.m_id;
}

Line.prototype.clearMapObject = function() {
  if (this.lineMapObject != null)
  {
    this.lineMapObject.setMap(null);
    this.lineMapObject = null;
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
  if (markerId != this.m_target)
  {
    this.m_target = markerId;
    this.update();
    $("#dynlinetarget" + this.m_id + " > option[value=" + markerId + "]").attr("selected", "selected");
  }
}

Line.prototype.update = function() {
  if (this.m_source == -1 || this.m_target == -1)
  {
    this.clearMapObject();
    
    $("#dynlinedist" + this.m_id).html( "n/a" );
    $("#dynlineangle" + this.m_id).html( "n/a" );
  }
  else
  {
        if (this.m_lineMapObject == null)
        {   
            this.m_lineMapObject = new google.maps.Polyline( { 
                strokeColor: '#ff0000', 
                strokeWeight: 2, 
                strokeOpacity: 0.7, 
                geodesic: true } );
            this.m_lineMapObject.setMap( map );
        }
        
        var m1 = markers[this.m_source];
        var m2 = markers[this.m_target];
        
        var path = new google.maps.MVCArray;
        path.push( m1.marker.getPosition() );
        path.push( m2.marker.getPosition() );
        this.m_lineMapObject.setPath( path ); 
        
        if( this.m_source == this.m_target )
        {
            $("#dynlinedist" + this.m_id).html( "0m" );
            $("#dynlineangle" + this.m_id).html( "n/a" );
        }
        else
        {
            var da = Coordinates.dist_angle_geodesic( m1.marker.getPosition(), m2.marker.getPosition() );
            
            var dist = da.dist.toFixed();
            $("#dynlinedist" + this.m_id).html( dist + "m" );
            if( dist == 0 )
            {
                $("#dynlineangle" + this.m_id).html( "n/a" );
            }
            else
            {
                $("#dynlineangle" + this.m_id).html( da.angle.toFixed( 1 ) + "°" );
            }
        }
    }
}

Line.prototype.updateMarkerMoved = function(markerId) {
  if (this.m_source == markerId || this.m_target == markerId)
  {
    this.update();
  }
}

Line.prototype.updateMarkerRemoved = function(markerId) {
  if (this.m_source == markerId )
  {
    this.m_source = -1;
    this.clearMapObject();
  }
  
  if( this.m_target == markerId )
  {
    this.m_target = -1;
    this.clearMapObject();
  }
  
  var source = $('#dynlinesource' + this.m_id);
  var target = $('#dynlinetarget' + this.m_id);
  
  source.empty();
  target.empty();

  source.append('<option value="-1">?</option>');
  target.append('<option value="-1">?</option>');

  for( var i = 0; i < markers.length; ++i )
  {
    var m = markers[i];
    if( !m.free )
    {   
      source.append('<option value="'+m.id+'">'+m.alpha+'</option>');
      target.append('<option value="'+m.id+'">'+m.alpha+'</option>');
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

  for( var i = 0; i < markers.length; ++i )
  {
    var m = markers[i];
    if( !m.free )
    {   
      source.append('<option value="'+m.id+'">'+m.alpha+'</option>');
      target.append('<option value="'+m.id+'">'+m.alpha+'</option>');
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
  for (var index = 0; index < this.m_lines.length; ++index)
  {
    var line = this.m_lines[index];
    if (line == null) continue;
    
    if (line.getId() == id)
    {
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
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    a.push(line.getEndpointsString());
  }
  
  return a.join("*");
}

Lines.prototype.saveCookie = function()
{
  $.cookie("lines", this.getLinesText(), {expires: 30});
}

Lines.prototype.selectLineSourceById = function(id, markerId)
{
  var index = this.getLineIndex( id );
  this.m_lines[index].setSource(markerId);
  this.saveCookie();
}

Lines.prototype.selectLineSource = function( id )
{
  var line = this.getLineById( id );
  
  var markerId = -1;
  var opt = $("#dynlinesource" + id +" option:selected");
  if( opt )
  {
    markerId = parseInt( opt.val() );
  }
  
  this.selectLineSourceById( id, markerId );
}


Lines.prototype.selectLineTargetById = function( id, markerId )
{
  var index = this.getLineIndex( id );
  this.m_lines[index].setTarget(markerId);
  this.saveCookie();
}

Lines.prototype.selectLineTarget = function( id )
{
  var markerId = -1;
  var opt = $("#dynlinetarget" + id +" option:selected");
  if( opt )
  {
    markerId = parseInt( opt.val() );
  }
  
  this.selectLineTargetById( id, markerId );
}

Lines.prototype.updateLinesMarkerMoved = function( markerId )
{
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    line.updateMarkerMoved(markerId);
  }
}


Lines.prototype.updateLinesMarkerAdded = function( markerId ) {
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    line.updateMarkerAdded(markerId);
  }
}

Lines.prototype.updateLinesMarkerRemoved = function( markerId ) {
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    line.updateMarkerRemoved(markerId);
  }
  
  this.saveCookie();
}

Lines.prototype.updateLine = function( id )
{
  var index = this.getLineIndex( id );
  if (index == -1) return;
  if (this.m_lines[index] == null) return;
  
  this.m_lines[index].update();
}

Lines.prototype.deleteLine = function( id )
{
  $('#dynLine' + id).remove();
  
  var index = this.getLineIndex( id );
  if (index == -1 || this.m_lines[index] == null) return;
  
  this.m_lines[index].clearMapObject();
  this.m_lines[index] = null;
  
  this.saveCookie();
}

Lines.prototype.deleteAllLines = function()
{
  for (var i = 0; i < this.m_lines.length; ++i)
  {
    var line = this.m_lines[i];
    if (line == null) continue;
    this.deleteLine(line.getId());
  }
}
