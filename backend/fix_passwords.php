<?php
// Direct PDO connection — no config files needed
$host = '127.0.0.1';
$port = '3307';
$db   = 'job_portal';
$user = 'root';
$pass = '';  // leave empty for XAMPP default

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $studentHash = password_hash('student123', PASSWORD_BCRYPT, ['cost' => 10]);
    $companyHash = password_hash('company123', PASSWORD_BCRYPT, ['cost' => 10]);
    $adminHash   = password_hash('admin123',   PASSWORD_BCRYPT, ['cost' => 10]);

    $pdo->prepare("UPDATE users     SET password = ?")->execute([$studentHash]);
    $pdo->prepare("UPDATE companies SET password = ?")->execute([$companyHash]);
    $pdo->prepare("UPDATE admins    SET password = ?")->execute([$adminHash]);

    echo "All passwords fixed!\n\n";
    echo "Student → kavindu@gmail.com   / student123\n";
    echo "Company → hr@techvision.lk    / company123\n";
    echo "Admin   → admin@jobportal.com / admin123\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}