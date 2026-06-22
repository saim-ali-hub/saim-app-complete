
<?php
session_start();

$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data["username"] ?? "");

$file = "users_data.txt";
$users = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

header('Content-Type: application/json');

if (in_array($username, $users)) {

    $_SESSION["user"] = $username;

    echo json_encode([
        "status" => "success",
        "user" => $username
    ]);

} else {
    echo json_encode([
        "status" => "fail"
    ]);
}
?>
