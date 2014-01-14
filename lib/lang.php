<?php
error_reporting(~0);
ini_set('display_errors', 1);

/*
  Determine user's language out of an given set
  Implementation for http_negotiate_language, if it's not
  available at your system.

  :author:        Anonymous

  @param languages array list of languages as defined by RFC 1766
  @param accept the HTTP_ACCEPT_LANGUAGE string
*/
function prefered_language($languages, $accept)
{
  // HTTP_ACCEPT_LANGUAGE is defined in
  // http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4
  // pattern to find is therefore something like this:
  //    1#( language-range [ ";" "q" "=" qvalue ] )
  // where:
  //    language-range  = ( ( 1*8ALPHA *( "-" 1*8ALPHA ) ) | "*" )
  //    qvalue         = ( "0" [ "." 0*3DIGIT ] )
  //            | ( "1" [ "." 0*3("0") ] )
  preg_match_all("/([[:alpha:]]{1,8})(-([[:alpha:]|-]{1,8}))?" .
                 "(\s*;\s*q\s*=\s*(1\.0{0,3}|0\.\d{0,3}))?\s*(,|$)/i",
                 $accept, $hits, PREG_SET_ORDER);

  // default language (in case of no hits) is the first in the array
  $bestlang = $languages[0];
  $bestqval = 0;

  foreach ($hits as $arr) {
    // read data from the array of this hit
    $langprefix = strtolower ($arr[1]);
    if (!empty($arr[3])) {
      $langrange = strtolower ($arr[3]);
      $language = $langprefix . "-" . $langrange;
    }
    else $language = $langprefix;
    $qvalue = 1.0;
    if (!empty($arr[5])) $qvalue = floatval($arr[5]);

    // find q-maximal language
    if (in_array($language,$languages) && ($qvalue > $bestqval)) {
      $bestlang = $language;
      $bestqval = $qvalue;
    }
    // if no direct hit, try the prefix only but decrease q-value
    // by 10% (as http_negotiate_language does)
    else if (in_array($langprefix,$languages) 
        && (($qvalue*0.9) > $bestqval)) 
    {
      $bestlang = $langprefix;
      $bestqval = $qvalue*0.9;
    }
  }
  return $bestlang;
}

function getLang($source)
{
  if (isset($source) && ($source == 'en' || $source == 'de'))
  {
    return $source;
  }
  return 'invalid';
}

function getLangSwitchUrl($server, $lang)
{
  if (isset($server['SCRIPT_URI']))
  {
    echo $server['SCRIPT_URI'] . '?lang=' . $lang;
  }
}

$lang = 'invalid';
//if (isset($_GET['lang'])) $lang = getLang($_GET['lang']);
if ($lang == 'invalid' && isset($_COOKIE['lang'])) $lang = getLang($_COOKIE['lang']);
if ($lang == 'invalid') $lang = prefered_language(array('en', 'de'), $_SERVER['HTTP_ACCEPT_LANGUAGE']);
setcookie('lang', $lang, time()+3600*24*30);

function TT($en, $de)
{
  global $lang;
  if ($lang == 'en')
  {
    echo $en;
  }
  else
  {
    echo $de;
  }
}
?>
