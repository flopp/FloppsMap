function langEN()
{
  trackAction("langEN");
  $.cookie("lang", "en", {expires:30});
  window.location.reload(true);
}

function langDE()
{
  trackAction("langDE");
  $.cookie("lang", "de", {expires:30});
  window.location.reload(true);
}

var lang = "en";
function TT(en, de)
{
  return (lang == "en") ? en : de;
}
