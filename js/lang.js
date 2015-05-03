function langEN()
{
  trackAction("langEN");
  $.i18n.setLng("en", function(t) { $(document).i18n(); });
}

function langDE()
{
  trackAction("langDE");
  $.i18n.setLng("de", function(t) { $(document).i18n(); });
}

var lang = "en";
function TT(en, de)
{
  return (lang == "en") ? en : de;
}
