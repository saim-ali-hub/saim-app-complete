<?php

$type = $_GET['type'] ?? '';

if ($type == 'quiz') {

    $json = '/var/www/private_data/quiz/list.json';

} elseif ($type == 'lab') {

    $json = '/var/www/private_data/lab/list.json';

} else {

    die("Invalid Type");
}

header('Content-Type: application/json');
echo file_get_contents($json);
