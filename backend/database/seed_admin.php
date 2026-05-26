<?php
// ============================================================
// database/seed_admin.php
// Run once to create a real admin with a secure password.
// Usage:  php database/seed_admin.php
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

$password = 'Admin@2025!';          // Change this!
$hash     = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

$db   = Database::getConnection();
$stmt = $db->prepare(
    "INSERT INTO admins (name, email, password)
     VALUES ('Super Admin', 'admin@jobportal.com', :hash1)
     ON DUPLICATE KEY UPDATE password = :hash2"
);
$stmt->execute([':hash1' => $hash, ':hash2' => $hash]);

echo "Admin created / updated.\n";
echo "   Email:    admin@jobportal.com\n";
echo "   Password: $password\n";
echo "   Hash:     $hash\n";
echo "\nDelete this file before going to production!\n";