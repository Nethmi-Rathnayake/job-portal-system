<?php
function sendSuccess(mixed $data = null, string $message = 'Success', int $code = 200): never {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data,
    ]);
    exit;
}

function sendError(string $message = 'An error occurred', int $code = 400, mixed $errors = null): never {
    http_response_code($code);
    $response = [
        'success' => false,
        'message' => $message,
    ];
    if ($errors !== null) {
        $response['errors'] = $errors;
    }
    echo json_encode($response);
    exit;
}

function sendUnauthorized(string $message = 'Unauthorized'): never {
    sendError($message, 401);
}

function sendForbidden(string $message = 'Forbidden'): never {
    sendError($message, 403);
}

function sendNotFound(string $message = 'Resource not found'): never {
    sendError($message, 404);
}

function getJsonBody(): array {
    $raw  = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sanitize(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateRequired(array $data, array $fields): array {
    $errors = [];
    foreach ($fields as $field) {
        if (empty($data[$field])) {
            $errors[] = "$field is required.";
        }
    }
    return $errors;
}

function validatePassword(string $password): array {
    $errors = [];
    if (strlen($password) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }
    return $errors;
}

function paginate(int $page, int $perPage = DEFAULT_PAGE_SIZE): array {
    $page   = max(1, (int) $page);
    $offset = ($page - 1) * $perPage;
    return ['limit' => $perPage, 'offset' => $offset, 'page' => $page];
}