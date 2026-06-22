<?php

function respond($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === "quiz") {
    if (!file_exists("/var/www/private_data/validator/evaluate_quiz.php")) {
        respond(["error" => "validator missing"], 500);
    }
    require "/var/www/private_data/validator/evaluate_quiz.php";
    exit;
}

if ($action === "lab") {
    require "/var/www/private_data/validator/evaluate_lab.php";
    exit;
}

respond(["error" => "Invalid action"], 400);
