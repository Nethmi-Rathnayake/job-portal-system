<?php
// ============================================================
// config/config.php
// Global application constants
// ============================================================

// ── JWT ─────────────────────────────────────────────────────
define('JWT_SECRET',     'JP@S3cur3_JWT_S3cr3t_Ch@ng3_In_Pr0d!');  // CHANGE IN PRODUCTION
define('JWT_EXPIRY',     86400);   // 24 hours in seconds
define('JWT_ALGORITHM', 'HS256');

// ── App ─────────────────────────────────────────────────────
define('APP_NAME',    'Job Portal System');
define('APP_VERSION', '1.0.0');
define('APP_ENV',     'development');   // 'production' in prod

// ── File Uploads ─────────────────────────────────────────────
define('UPLOAD_BASE_PATH', __DIR__ . '/../uploads/');
define('RESUME_UPLOAD_PATH', UPLOAD_BASE_PATH . 'resumes/');
define('LOGO_UPLOAD_PATH',   UPLOAD_BASE_PATH . 'logos/');
define('PROFILE_UPLOAD_PATH', UPLOAD_BASE_PATH . 'profiles/');

define('MAX_RESUME_SIZE',  5 * 1024 * 1024);   // 5 MB
define('MAX_IMAGE_SIZE',   2 * 1024 * 1024);   // 2 MB

define('ALLOWED_RESUME_TYPES', ['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// ── URL (adjust to your local/production URL) ───────────────
define('APP_URL',    'http://localhost:8000');
define('UPLOAD_URL', APP_URL . '/uploads/');

// ── Pagination ───────────────────────────────────────────────
define('DEFAULT_PAGE_SIZE', 10);

// ── Email (SMTP — configure for production) ──────────────────
define('MAIL_HOST',     'smtp.gmail.com');
define('MAIL_PORT',     587);
define('MAIL_USERNAME', 'your@gmail.com');
define('MAIL_PASSWORD', 'your_app_password');
define('MAIL_FROM',     'noreply@jobportal.com');
define('MAIL_FROM_NAME', APP_NAME);
