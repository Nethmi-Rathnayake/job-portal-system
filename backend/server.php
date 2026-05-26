<?php
ob_start();
ini_set('zlib.output_compression', 'Off');

// ============================================================
// server.php
// Use this when running PHP's built-in server:
//   php -S localhost:8000 server.php
// ============================================================

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve uploads directory statically
if (strpos($uri, '/uploads/') === 0) {
    $file = __DIR__ . $uri;

    if (file_exists($file) && is_file($file)) {
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        $mimes = [
            'pdf'  => 'application/pdf',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'webp' => 'image/webp',
            'gif'  => 'image/gif',
        ];

        $mime = $mimes[$ext] ?? mime_content_type($file);

        // CORS headers — allow React frontend
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Content-Type: $mime");
        header("Content-Length: " . filesize($file));
        header("Cache-Control: public, max-age=86400");

        ob_end_clean();
        readfile($file);
        return true;
    }

    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'File not found.']);
    return false;
}

// Route everything else to index.php
require __DIR__ . '/index.php';