<?php
// ============================================================
// config/database.php
// PDO Database Connection — singleton pattern
// ============================================================

class Database {
    private static ?PDO $instance = null;

    // ── Connection settings ──────────────────────────────────
    private static string $host     = '127.0.0.1';
    private static int    $port     = 3307;
    private static string $dbName   = 'job_portal';
    private static string $username = 'root';
    private static string $password = '';
    private static string $charset  = 'utf8mb4';

    // Prevent direct instantiation
    private function __construct() {}
    private function __clone()     {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                self::$host,
                self::$port,
                self::$dbName,
                self::$charset
            );

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$instance = new PDO($dsn, self::$username, self::$password, $options);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
                exit;
            }
        }

        return self::$instance;
    }

    public static function getConnection(): PDO {
        return self::getInstance();
    }
}