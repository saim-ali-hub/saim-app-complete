<?php

function respond($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

$allowed_sections = ['quiz','lab','test','evaluation','recording'];

$section = basename($_GET['section'] ?? '');
$file = basename($_GET['file'] ?? '');

if (!in_array($section, $allowed_sections)) {
    respond(["error" => "Access denied"], 403);
}

$base = "/var/www/private_data/";
$path = $base . $section . "/" . $file;

if (!file_exists($path)) {
    respond(["error" => "File not found"], 404);
}

echo file_get_contents($path);
exit;
