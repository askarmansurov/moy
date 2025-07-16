<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$dsn = "mysql:host=localhost;dbname=YOUR_DB;charset=utf8mb4";
$user = "YOUR_USER";
$pass = "YOUR_PASS";

try {
    $pdo = new PDO($dsn, $user, $pass, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connect error"]);
    exit;
}

// Получаем JSON
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "No data"]);
    exit;
}

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Fill all fields"]);
    exit;
}

// Ищем мастера
$stmt = $pdo->prepare("SELECT id, password_hash FROM masters WHERE email = ?");
$stmt->execute([$email]);
$master = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$master) {
    echo json_encode(["success" => false, "message" => "Мастер не найден"]);
    exit;
}

// Проверяем пароль
if (!password_verify($password, $master['password_hash'])) {
    echo json_encode(["success" => false, "message" => "Неверный пароль"]);
    exit;
}

// Успешный вход
echo json_encode([
    "success" => true,
    "message" => "Вход успешен",
    "master_id" => $master['id']
]);
