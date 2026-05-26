<?php
declare(strict_types=1);

// ── Error handling ────────────────────────────────────────
ini_set('display_errors', '0');
error_reporting(0);

// ── CORS + Content-Type ───────────────────────────────────
require_once __DIR__ . '/middleware/cors.php';

// ── Config ────────────────────────────────────────────────
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/jwt.php';

// ── Route ─────────────────────────────────────────────────
require_once __DIR__ . '/routes/api.php';