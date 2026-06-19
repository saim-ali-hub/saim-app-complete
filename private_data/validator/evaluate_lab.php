<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Content-Type: text/plain");

/* =========================
   1. READ INPUT
========================= */
$rawInput = file_get_contents("php://input");

$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    die("Invalid JSON input");
}

/* =========================
   2. GET LAB (SAFE)
========================= */
$lab = basename($input['lab'] ?? '', ".json");

if (!$lab) {
    http_response_code(400);
    die("Missing lab");
}

/* =========================
   3. GET USER FROM APACHE
========================= */
$user = $_SERVER['REMOTE_USER'] ?? '';

if (!$user) {
    http_response_code(403);
    die("Unauthorized - No AD session");
}

/* ================
   4. GET MACHINE IP
================ */
$ip = $input['ip'] ?? '';

if (!filter_var($ip, FILTER_VALIDATE_IP)) {
    die("Invalid IP address");
}

/* =========================
   5. VALIDATION
========================= */
if (!preg_match('/^lab[0-9]+$/', $lab)) {
    die("Invalid lab format");
}

/* system user block */
$blocked_users = ['root','apache','nginx','mysql','bin','daemon'];

if (in_array($user, $blocked_users, true)) {
    die("System user not allowed");
}

/* =========================
   6. SAFE LOGGING (NO RAW INPUT DUMP)
========================= */
$logFile = "/var/www/private_data/lab/results/debug.log";

file_put_contents(
    $logFile,
    date("Y-m-d H:i:s") . " USER=$user LAB=$lab\n",
    FILE_APPEND | LOCK_EX
);

/* =========================
   7. SAFE EXECUTION (NO SHELL INJECTION)
========================= */
$script = "/var/www/private_data/lab/validate_lab.sh";

$cmd = [
    "sudo",
    "-n",
    "/usr/bin/bash",
    $script,
    $user,
    $ip,
    $lab
];

$escaped = array_map("escapeshellarg", $cmd);

exec(implode(" ", $escaped) . " 2>&1", $output, $status);

/* ==========================
   8. RETURN EXECUTION STATUS
=========================== */
if ($status !== 0) {
    http_response_code(500);
}

/* =========================
   9. OUTPUT
========================= */
echo implode("\n", $output);

?>
