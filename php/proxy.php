<?php
$url = (isset($_GET['url'])) ? $_GET['url'] : false;
if(!$url) exit;

$referer = (isset($_SERVER['HTTP_REFERER'])) ? strtolower($_SERVER['HTTP_REFERER']) : false;
$is_allowed = $referer && strpos($referer, strtolower($_SERVER['SERVER_NAME'])) !== false;

$string = 'You are not allowed to use this proxy!';
if ($is_allowed) {
    $curlSession = curl_init();
    curl_setopt($curlSession, CURLOPT_URL, $url);
    curl_setopt($curlSession, CURLOPT_BINARYTRANSFER, true);
    curl_setopt($curlSession, CURLOPT_RETURNTRANSFER, true);
    $string = curl_exec($curlSession);
    curl_close($curlSession);
}

$json = json_encode($string);
$callback = (isset($_GET['callback'])) ? $_GET['callback'] : false;
if ($callback) {
    $jsonp = "$callback($json)";
    header('Content-Type: application/javascript');
    echo $jsonp;
    exit;
}
echo $json;
?>
