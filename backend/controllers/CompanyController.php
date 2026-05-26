<?php
// ============================================================
// controllers/CompanyController.php
// Company profile management (public + private)
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/CompanyModel.php';

class CompanyController {
    private CompanyModel $model;

    public function __construct() {
        $this->model = new CompanyModel();
    }

    // ── GET /companies  (public list with pagination) ─────────
    public function index(): void {
        $page   = (int) ($_GET['page'] ?? 1);
        $search = $_GET['search'] ?? '';
        $result = $this->model->getAllPublic($page, $search);
        sendSuccess($result);
    }

    // ── GET /companies/{id}  (public profile) ─────────────────
    public function show(int $id): void {
        $company = $this->model->getPublicProfile($id);
        if (!$company) sendNotFound('Company not found.');
        sendSuccess(['company' => $company]);
    }

    // ── GET /companies/profile  (own profile, company auth) ───
    public function myProfile(): void {
        $payload = requireRole('company');
        $company = $this->model->findById($payload['sub']);
        if (!$company) sendNotFound();

        // Remove password from response
        unset($company['password']);
        sendSuccess(['company' => $company]);
    }

    // ── PUT /companies/profile  (update own profile) ──────────
    public function updateProfile(): void {
        $payload = requireRole('company');
        $data    = getJsonBody();

        $allowed = ['company_name', 'description', 'website', 'location',
                    'industry', 'phone', 'founded_year', 'employee_count'];
        $clean   = [];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $clean[$field] = is_string($data[$field]) ? sanitize($data[$field]) : $data[$field];
            }
        }

        if (empty($clean)) sendError('No valid fields provided.', 422);

        $this->model->update($payload['sub'], $clean);
        $company = $this->model->findById($payload['sub']);
        unset($company['password']);

        sendSuccess(['company' => $company], 'Profile updated successfully.');
    }

    // ── POST /companies/logo  (upload company logo) ───────────
    public function uploadLogo(): void {
        $payload = requireRole('company');

        if (empty($_FILES['logo'])) {
            sendError('No logo file uploaded.', 422);
        }

        $file     = $_FILES['logo'];
        $mimeType = mime_content_type($file['tmp_name']);

        if (!in_array($mimeType, ALLOWED_IMAGE_TYPES, true)) {
            sendError('Invalid file type. Use JPEG, PNG, or WEBP.', 422);
        }

        if ($file['size'] > MAX_IMAGE_SIZE) {
            sendError('Logo too large. Max 2MB.', 422);
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = 'logo_' . $payload['sub'] . '_' . time() . '.' . $ext;
        $destPath = LOGO_UPLOAD_PATH . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            sendError('Failed to save logo.', 500);
        }

        $relativePath = 'logos/' . $fileName;
        $this->model->updateLogo($payload['sub'], $relativePath);

        sendSuccess(['logo' => UPLOAD_URL . $relativePath], 'Logo uploaded successfully.');
    }

    // ── PUT /companies/password ───────────────────────────────
    public function changePassword(): void {
        $payload = requireRole('company');
        $data    = getJsonBody();
        $errors  = validateRequired($data, ['current_password', 'new_password']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $company = $this->model->findByEmail(
            $this->model->findById($payload['sub'])['email']
        );

        if (!password_verify($data['current_password'], $company['password'])) {
            sendError('Current password is incorrect.', 401);
        }

        $pwErrors = validatePassword($data['new_password']);
        if ($pwErrors) sendError($pwErrors[0], 422);

        $db   = \Database::getConnection();
        $hash = password_hash($data['new_password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $db->prepare("UPDATE companies SET password = :pw WHERE id = :id")
           ->execute([':pw' => $hash, ':id' => $payload['sub']]);

        sendSuccess(null, 'Password changed successfully.');
    }
}
