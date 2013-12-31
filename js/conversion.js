function getFloat(s, min, max)
{
  s = s.trim();
  var pattern = /^[+-]?(([0-9]+)|([0-9]+\.[0-9]*)|([0-9]*\.[0-9]+))$/;
  if (!s.match(pattern)) return null;
  
  var v = parseFloat(s);
  if (v == null || v == NaN) return null;
  if (v < min || v > max) return null;
  return v;
}

function getInteger(s, min, max)
{
  s = s.trim();
  var pattern = /^[+-]?[0-9]+$/;
  if (!s.match(pattern)) return null;
  
  /* specify radix=10, otherwise numbers with leading zeros are interpreted as octal numbers */
  var v = parseInt(s, 10);
  if (v == null || v == NaN) return null;
  if (v < min || v > max) return null;
  return v;
}
