<?php
    $referer = (isset($_SERVER['HTTP_REFERER'])) ? strtolower($_SERVER['HTTP_REFERER']) : '';
    $is_allowed = ($referer !== '') && (strpos($referer, strtolower($_SERVER['SERVER_NAME'])) !== false);
    if (!$is_allowed) {
        http_response_code(401);
        echo 'You are not allowed to use this proxy!';
        exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];
    if ($method !== 'GET') {
        http_response_code(405);
        echo 'Only GET is allowed!';
        exit;
    }

    if (!($_GET && $_GET['url'])) { 
        http_response_code(400);
        echo 'We need an URL!';
        exit;
    }
    $url = $_GET['url'];

    $curlSession = curl_init();
    curl_setopt($curlSession, CURLOPT_URL, $url);
    curl_setopt($curlSession, CURLOPT_BINARYTRANSFER, true);
    curl_setopt($curlSession, CURLOPT_RETURNTRANSFER, true);
    $string = curl_exec($curlSession);
    curl_close($curlSession);

    $json = json_encode($string);
    $callback = (isset($_GET['callback'])) ? $_GET['callback'] : '';
    if ($callback !== '') {
        $jsonp = "$callback($json)";
        header('Content-Type: application/javascript');
        echo $jsonp;
        exit;
    }
    echo $json;
?>
