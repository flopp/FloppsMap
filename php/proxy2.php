<?php
	$referer = (isset($_SERVER['HTTP_REFERER'])) ? strtolower($_SERVER['HTTP_REFERER']) : false;
	
	$is_allowed = $referer && strpos($referer, strtolower($_SERVER['SERVER_NAME'])) !== false;
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
  	if (strpos($url, "http://a.tiles.wmflabs.org/") != 0 &&
  		strpos($url, "http://b.tiles.wmflabs.org/") != 0 &&
  		strpos($url, "http://c.tiles.wmflabs.org/") != 0 &&
  		strpos($url, "http://d.tiles.wmflabs.org/") != 0 &&
  		strpos($url, "http://www.opencaching.nl/") != 0 &&
  		strpos($url, "http://www.opencaching.ro/") != 0 &&
  		strpos($url, "http://www.opencaching.us/") != 0) {
  		http_response_code(400);
  		echo 'URL is not allowed!';
		exit;	
  	}

	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    	
	$result = curl_exec($ch);
	$info = curl_getinfo($ch);
	curl_close($ch);

	header('Content-Type: application/json');
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT');
	http_response_code($info['http_code']);
	echo $result;
?>
