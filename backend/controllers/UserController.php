<?php
// ============================================================
// controllers/UserController.php
// Student profile management + password change
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/UserModel.php';

class UserController {
    private UserModel $model;

    public function __construct() {
        $this->model = new UserModel();
    }

    // ── GET /users/profile ────────────────────────────────────
    public function profile(): void {
        $payload = requireRole('student');
        $user    = $this->model->getProfile($payload['sub']);
        if (!$user) sendNotFound('User not found.');
        sendSuccess(['user' => $user]);
    }

    // ── PUT /users/profile ────────────────────────────────────
    public function updateProfile(): void {
        $payload = requireRole('student');
        $data    = getJsonBody();

        $allowed = ['name', 'phone', 'location', 'bio', 'skills'];
        $clean   = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $clean[$field] = sanitize($data[$field]);
            }
        }

        if (empty($clean)) sendError('No valid fields to update.', 422);

        $this->model->updateProfile($payload['sub'], $clean);
        $user = $this->model->getProfile($payload['sub']);
        sendSuccess(['user' => $user], 'Profile updated successfully.');
    }

    // ── POST /users/profile/image ─────────────────────────────
    public function uploadProfileImage(): void {
        $payload = requireRole('student');

        if (empty($_FILES['image'])) {
            sendError('No image file uploaded.', 422);
        }

        $file     = $_FILES['image'];
        $mimeType = mime_content_type($file['tmp_name']);

        if (!in_array($mimeType, ALLOWED_IMAGE_TYPES, true)) {
            sendError('Invalid file type. Only JPEG, PNG, WEBP allowed.', 422);
        }

        if ($file['size'] > MAX_IMAGE_SIZE) {
            sendError('Image file too large. Max 2MB.', 422);
        }

        // Unique filename
        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'profile_' . $payload['sub'] . '_' . time() . '.' . $ext;
        $destPath = PROFILE_UPLOAD_PATH . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            sendError('Failed to save image.', 500);
        }

        $relativePath = 'profiles/' . $fileName;
        $this->model->updateProfileImage($payload['sub'], $relativePath);

        sendSuccess([
            'profile_image' => UPLOAD_URL . $relativePath,
        ], 'Profile image updated.');
    }

    // ── PUT /users/password ───────────────────────────────────
    public function changePassword(): void {
        $payload = requireRole('student');
        $data    = getJsonBody();
        $errors  = validateRequired($data, ['current_password', 'new_password']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        // Fetch user with password hash
        $user = $this->model->findById($payload['sub']);
        if (!$user || !password_verify($data['current_password'], $user['password'])) {
            sendError('Current password is incorrect.', 401);
        }

        $pwErrors = validatePassword($data['new_password']);
        if ($pwErrors) sendError($pwErrors[0], 422);

        $this->model->updatePassword($payload['sub'], $data['new_password']);
        sendSuccess(null, 'Password changed successfully.');
    }

    // ── GET /users/{id}  — public profile ────────────────────
    public function publicProfile(int $id): void {
        $user = $this->model->getProfile($id);
        if (!$user) sendNotFound('User not found.');
        sendSuccess(['user' => $user]);
    }
}
