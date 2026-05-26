<?php
// ============================================================
// middleware/auth.php
// JWT Authentication + Role Guard middleware
// ============================================================

require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/response.php';

/**
 * Verifies the JWT and returns the decoded payload.
 * Calls sendUnauthorized() and exits on failure.
 */
function requireAuth(): array {
    $token = JWT::getBearerToken();

    if (!$token) {
        sendUnauthorized('Authentication token missing.');
    }

    $payload = JWT::decode($token);

    if (!$payload) {
        sendUnauthorized('Invalid or expired token.');
    }

    return $payload;
}

/**
 * Ensure the authenticated user has the required role.
 *
 * @param string|array $roles  'student' | 'company' | 'admin' or array
 */
function requireRole(string|array $roles): array {
    $payload = requireAuth();

    $allowed = is_array($roles) ? $roles : [$roles];

    if (!in_array($payload['role'], $allowed, true)) {
        sendForbidden('You do not have permission to perform this action.');
    }

    return $payload;
}

/**
 * Optional auth — returns payload or null (doesn't exit).
 */
function optionalAuth(): ?array {
    $token = JWT::getBearerToken();
    if (!$token) return null;
    return JWT::decode($token);
}
