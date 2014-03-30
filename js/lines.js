function Lines() {
  this.m_nextLineId = 0;
  this.m_lines = new Array();
}

Lines.prototype.m_nextLineId = 0;
Lines.prototype.m_lines = null;

Lines.prototype.newLine = function() {
  var m = new Object();
  m.id = this.m_nextLineId;
  this.m_nextLineId++;
  
  m.line = null;
  m.source = -1;
  m.target = -1;
  this.m_lines.push( m );
  
  $('#dynLineDiv').append( 
  "<div id=\"dynLine" + m.id + "\">" +
  "<table style=\"width: 100%\">" +
  "<tr>" +
  "<td>" +
  "<select id=\"dynlinesource" + m.id + "\" class=\"my-small-select\" title=\"" + TT("Source", "Quelle") + "\" onchange=\"theLines.selectLineSource("+m.id+")\"><option value=\"-1\">?</option></select>" +
  "&nbsp;&rarr;&nbsp;" +
  "<select id=\"dynlinetarget" + m.id + "\" class=\"my-small-select\" title=\"" + TT("Target", "Ziel") + "\" onchange=\"theLines.selectLineTarget("+m.id+")\"><option value=\"-1\">?</option></select>" +
  "</td>" +
  "<td>" +
  "<button class=\"my-button btn btn-mini btn-danger\" style=\"float: right\" title=\"" + TT("Delete line", "Lösche Linie") + "\" type=\"button\" onClick=\"trackLine('delete'); theLines.deleteLine(" + m.id + ")\"><i class=\"fa fa-trash-o\"></i></button>" +
  "<div>" +
  "</div>" +
  "</td>" +
  "</tr>" +
  "<tr><td colspan=\"2\"><i class=\"fa fa-arrows-h\"></i> <span id=\"dynlinedist" + m.id + "\">n/a</span> <i class=\"fa fa-compass\"></i> <span id=\"dynlineangle" + m.id + "\">n/a</span></td></tr>" +
  "</table>" +
  "</div>"
  );
  
  for( var i = 0; i < markers.length; ++i )
  {
    if( !markers[i].free )
    {
      this.updateLineMarkerAdded( m.id, markers[i].id );
    }
  }
  
  this.saveCookie();
  
  return m.id;
}

Lines.prototype.getLineIndex = function(id)
{
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    if( line.id == id )
    {
      return index;
    }
  }
  
  return -1;
}

Lines.prototype.getLineById = function( id )
{
  return this.m_lines[this.getLineIndex( id )];
}



Lines.prototype.getLinesText = function()
{
  var a = Array();
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    a.push( id2alpha( line.source ) + ":" + id2alpha( line.target ) );
  }
  
  return a.join("*");
}

Lines.prototype.saveCookie = function()
{
  $.cookie("lines", this.getLinesText(), {expires: 30});
}

Lines.prototype.selectLineSourceById = function( id, markerid )
{
  var index = this.getLineIndex( id );
  var line = this.m_lines[index];
     
  if( markerid != line.source )
  {
    line.source = markerid;
    this.updateLineIndex( index, id );
    $("#dynlinesource" + id + " > option[value=" + markerid + "]").attr("selected", "selected");
  }
  
  this.saveCookie();
}

Lines.prototype.selectLineSource = function( id )
{
  var line = this.getLineById( id );
  
  var markerid = -1;
  var opt = $("#dynlinesource" + id +" option:selected");
  if( opt )
  {
    markerid = parseInt( opt.val() );
  }
  
  this.selectLineSourceById( id, markerid );
}


Lines.prototype.selectLineTargetById = function( id, markerid )
{
  var index = this.getLineIndex( id );
  var line = this.m_lines[index];
  
  if( markerid != line.target )
  {
    line.target = markerid;
    this.updateLineIndex( index, id );
    $("#dynlinetarget" + id + " > option[value=" + markerid + "]").attr("selected", "selected");
  }
  
  this.saveCookie();
}

Lines.prototype.selectLineTarget = function( id )
{
  var markerid = -1;
  var opt = $("#dynlinetarget" + id +" option:selected");
  if( opt )
  {
    markerid = parseInt( opt.val() );
  }
  
  this.selectLineTargetById( id, markerid );
}

Lines.prototype.updateLinesMarkerMoved = function( markerId )
{
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    if( line.source == markerId || line.target == markerId )
    {
      this.updateLineIndex( index, line.id );
    }
  }
}



Lines.prototype.updateLineMarkerAdded = function( id, markerId )
{
  var source = $('#dynlinesource' + id);
  var target = $('#dynlinetarget' + id);
  
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
  
  $("#dynlinesource" + id + " > option[value=" + this.m_lines[id].source + "]").attr("selected", "selected");
  $("#dynlinetarget" + id + " > option[value=" + this.m_lines[id].target + "]").attr("selected", "selected");
}

Lines.prototype.updateLinesMarkerAdded = function( markerId )
{
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    this.updateLineMarkerAdded( line.id, markerId );
  }
}

Lines.prototype.updateLinesMarkerRemoved = function( markerid )
{
  for( var index = 0; index < this.m_lines.length; ++index )
  {
    var line = this.m_lines[index];
    if( line == null ) continue;
    
    if( line.source == markerid )
    {
      line.source = -1;
      if( line.line != null )
      {
        line.line.setMap( null );
        line.line = null;
      }
    }
    
    if( line.target == markerid )
    {
      line.target = -1;
      if( line.line != null )
      {
        line.line.setMap( null );
        line.line = null;
      }
    }
    
    var source = $('#dynlinesource' + line.id);
    var target = $('#dynlinetarget' + line.id);
    
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
    
    $("#dynlinesource" + line.id + " > option[value=" + line.source + "]").attr("selected", "selected");
    $("#dynlinetarget" + line.id + " > option[value=" + line.target + "]").attr("selected", "selected");
  }
  
  this.saveCookie();
}

Lines.prototype.updateLineIndex = function( index, id )
{
    var line = this.m_lines[index];
    if( line == null )
    {
        return;
    }
    
    if( line.source == -1 || line.target == -1 )
    {
        if( line.line != null )
        {
            line.line.setMap( null );
            line.line = null;
        }
        
        $("#dynlinedist" + id).html( "n/a" );
        $("#dynlineangle" + id).html( "n/a" );
    }
    else
    {
        if( line.line == null )
        {   
            line.line = new google.maps.Polyline( { 
                strokeColor: '#ff0000', 
                strokeWeight: 2, 
                strokeOpacity: 0.7, 
                geodesic: true } );
            line.line.setMap( map );
        }
        
        var m1 = markers[line.source];
        var m2 = markers[line.target];
        
        var path = new google.maps.MVCArray;
        path.push( m1.marker.getPosition() );
        path.push( m2.marker.getPosition() );
        line.line.setPath( path ); 
        
        if( line.source == line.target )
        {
            $("#dynlinedist" + id).html( "0m" );
            $("#dynlineangle" + id).html( "n/a" );
        }
        else
        {
            var da = Coordinates.dist_angle_geodesic( m1.marker.getPosition(), m2.marker.getPosition() );
            
            var dist = da.dist.toFixed();
            $("#dynlinedist" + id).html( dist + "m" );
            if( dist == 0 )
            {
                $("#dynlineangle" + id).html( "n/a" );
            }
            else
            {
                $("#dynlineangle" + id).html( da.angle.toFixed( 1 ) + "°" );
            }
        }
    }
}

Lines.prototype.updateLine = function( id )
{
  var index = this.getLineIndex( id );
  this.updateLineIndex( index, id );
}

Lines.prototype.deleteLine = function( id )
{
  $('#dynLine' + id).remove();
  
  var index = this.getLineIndex( id );
  var line = this.m_lines[index];
  
  if( line.line != null )
  {
    line.line.setMap( null );
    line.line = null;
  }
  
  this.m_lines[index] = null;
  
  this.saveCookie();
}

Lines.prototype.deleteAllLines = function()
{
  for (var i = 0; i < this.m_lines.length; ++i)
  {
    var line = this.m_lines[i];
    if (line == null) continue;
    this.deleteLine(line.id);
  }
}
