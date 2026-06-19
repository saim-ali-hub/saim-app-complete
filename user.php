<?php

header('Content-Type: application/json');

echo json_encode([
    "user" => $_SERVER['REMOTE_USER'] ?? ''
]); 
