function get_cookie_string(key, default_value)
{
  var stringval = Cookies.get(key);
  return (stringval != undefined) ? stringval : default_value;
}

function get_cookie_int(key, default_value)
{
  var stringval = Cookies.get(key);
  return (stringval != undefined) ? parseInt(stringval) : default_value;
}

function get_cookie_float(key, default_value)
{
  var stringval = Cookies.get(key);
  return (stringval != undefined) ? parseFloat(stringval) : default_value;
}
