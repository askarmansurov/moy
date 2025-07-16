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

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$name || !$phone || !$email || !$password) {
    echo json_encode(["success" => false, "message" => "Fill all fields"]);
    exit;
}

// Проверим на дубликаты
$stmt = $pdo->prepare("SELECT id FROM masters WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit;
}

// Хешируем пароль
$hash = password_hash($password, PASSWORD_BCRYPT);

// Вставляем мастера
$stmt = $pdo->prepare("INSERT INTO masters (name, phone, email, password_hash) VALUES (?, ?, ?, ?)");
$stmt->execute([$name, $phone, $email, $hash]);

echo json_encode(["success" => true, "message" => "Мастер зарегистрирован"]);
