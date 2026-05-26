<?php
// ============================================================
// controllers/AuthController.php
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../models/CompanyModel.php';

class AuthController {
    private UserModel    $userModel;
    private CompanyModel $companyModel;

    public function __construct() {
        $this->userModel    = new UserModel();
        $this->companyModel = new CompanyModel();
    }

    // ── POST /auth/register/student ──────────────────────────
    public function registerStudent(): void {
        $data   = getJsonBody();
        $errors = validateRequired($data, ['name', 'email', 'password']);
        if ($errors) sendError('Validation failed.', 422, $errors);
        if (!validateEmail($data['email'])) sendError('Invalid email address.', 422);
        $pwErrors = validatePassword($data['password']);
        if ($pwErrors) sendError($pwErrors[0], 422);
        if ($this->userModel->emailExists($data['email'])) sendError('Email is already registered.', 409);

        $id = $this->userModel->create([
            'name'     => sanitize($data['name']),
            'email'    => strtolower(trim($data['email'])),
            'password' => $data['password'],
            'role'     => 'student',
            'phone'    => isset($data['phone'])    ? sanitize($data['phone'])    : null,
            'location' => isset($data['location']) ? sanitize($data['location']) : null,
        ]);

        $token = JWT::encode(['sub' => $id, 'role' => 'student', 'name' => sanitize($data['name'])]);
        sendSuccess([
            'token' => $token,
            'user'  => ['id' => $id, 'name' => sanitize($data['name']), 'email' => strtolower(trim($data['email'])), 'role' => 'student'],
        ], 'Registration successful.', 201);
    }

    // ── POST /auth/register/company ──────────────────────────
    public function registerCompany(): void {
        $data   = getJsonBody();
        $errors = validateRequired($data, ['company_name', 'email', 'password']);
        if ($errors) sendError('Validation failed.', 422, $errors);
        if (!validateEmail($data['email'])) sendError('Invalid email address.', 422);
        if ($this->companyModel->emailExists($data['email'])) sendError('Email is already registered.', 409);
        $pwErrors = validatePassword($data['password']);
        if ($pwErrors) sendError($pwErrors[0], 422);

        $id = $this->companyModel->create([
            'company_name' => sanitize($data['company_name']),
            'email'        => strtolower(trim($data['email'])),
            'password'     => $data['password'],
            'description'  => isset($data['description']) ? sanitize($data['description']) : null,
            'website'      => isset($data['website'])     ? sanitize($data['website'])     : null,
            'location'     => isset($data['location'])    ? sanitize($data['location'])    : null,
            'industry'     => isset($data['industry'])    ? sanitize($data['industry'])    : null,
        ]);

        $token = JWT::encode(['sub' => $id, 'role' => 'company', 'name' => sanitize($data['company_name'])]);
        sendSuccess([
            'token'   => $token,
            'company' => ['id' => $id, 'company_name' => sanitize($data['company_name']), 'email' => strtolower(trim($data['email'])), 'role' => 'company'],
        ], 'Company registered successfully.', 201);
    }

    // ── POST /auth/login ─────────────────────────────────────
    public function login(): void {
        $data   = getJsonBody();
        $errors = validateRequired($data, ['email', 'password', 'role']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $email    = strtolower(trim($data['email']));
        $password = $data['password'];
        $role     = $data['role'];

        if (!in_array($role, ['student', 'company', 'admin'], true)) sendError('Invalid role specified.', 422);
        if ($role === 'admin') { $this->loginAdmin($email, $password); return; }

        if ($role === 'student') {
            $user = $this->userModel->findByEmail($email);
            if (!$user || !password_verify($password, $user['password'])) sendError('Invalid email or password.', 401);
            if (!$user['is_active']) sendError('Your account has been deactivated.', 403);
            $token = JWT::encode(['sub' => $user['id'], 'role' => 'student', 'name' => $user['name']]);
            sendSuccess([
                'token' => $token,
                'user'  => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => 'student', 'profile_image' => $user['profile_image']],
            ], 'Login successful.');
        }

        if ($role === 'company') {
            $company = $this->companyModel->findByEmail($email);
            if (!$company || !password_verify($password, $company['password'])) sendError('Invalid email or password.', 401);
            if (!$company['is_active']) sendError('Your company account has been deactivated.', 403);
            $token = JWT::encode(['sub' => $company['id'], 'role' => 'company', 'name' => $company['company_name']]);
            sendSuccess([
                'token'   => $token,
                'company' => ['id' => $company['id'], 'company_name' => $company['company_name'], 'email' => $company['email'], 'role' => 'company', 'logo' => $company['logo'], 'is_verified' => (bool)$company['is_verified']],
            ], 'Login successful.');
        }
    }

    // ── POST /auth/logout ────────────────────────────────────
    public function logout(): void {
        sendSuccess(null, 'Logged out successfully.');
    }

    // ── GET /auth/me ─────────────────────────────────────────
    public function me(): void {
        require_once __DIR__ . '/../middleware/auth.php';
        $payload = requireAuth();
        if ($payload['role'] === 'student') {
            $user = $this->userModel->getProfile($payload['sub']);
            sendSuccess(['user' => $user, 'role' => 'student']);
        }
        if ($payload['role'] === 'company') {
            $company = $this->companyModel->getPublicProfile($payload['sub']);
            sendSuccess(['company' => $company, 'role' => 'company']);
        }
        if ($payload['role'] === 'admin') {
            sendSuccess(['id' => $payload['sub'], 'role' => 'admin', 'name' => $payload['name']]);
        }
        sendError('Unknown role.', 400);
    }

    // ── POST /auth/check-email ── Forgot Password Step 1 ─────
    public function checkEmail(): void {
        $data   = getJsonBody();
        $errors = validateRequired($data, ['email', 'role']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $email = strtolower(trim($data['email']));
        $role  = $data['role'];

        if ($role === 'student') {
            $user = $this->userModel->findByEmail($email);
            if (!$user) sendError('No account found with this email address.', 404);
            sendSuccess(['email' => $email, 'name' => $user['name']], 'Email verified.');
        }

        if ($role === 'company') {
            $company = $this->companyModel->findByEmail($email);
            if (!$company) sendError('No company account found with this email address.', 404);
            sendSuccess(['email' => $email, 'name' => $company['company_name']], 'Email verified.');
        }

        if ($role === 'admin') {
            $db   = Database::getConnection();
            $stmt = $db->prepare("SELECT id, name FROM admins WHERE email = :email LIMIT 1");
            $stmt->execute([':email' => $email]);
            $admin = $stmt->fetch();
            if (!$admin) sendError('No admin account found with this email address.', 404);
            sendSuccess(['email' => $email, 'name' => $admin['name']], 'Email verified.');
        }

        sendError('Invalid role specified.', 422);
    }

    // ── POST /auth/reset-password ── Forgot Password Step 2 ──
    public function resetPassword(): void {
        $data   = getJsonBody();
        $errors = validateRequired($data, ['email', 'role', 'new_password']);
        if ($errors) sendError('Validation failed.', 422, $errors);

        $email    = strtolower(trim($data['email']));
        $role     = $data['role'];
        $newPw    = $data['new_password'];

        $pwErrors = validatePassword($newPw);
        if ($pwErrors) sendError($pwErrors[0], 422);

        $hash = password_hash($newPw, PASSWORD_BCRYPT, ['cost' => 12]);
        $db   = Database::getConnection();

        if ($role === 'student') {
            $stmt = $db->prepare("UPDATE users SET password = :pw WHERE email = :email");
            $stmt->execute([':pw' => $hash, ':email' => $email]);
            if ($stmt->rowCount() === 0) sendError('Email not found.', 404);
            sendSuccess(null, 'Password reset successfully. You can now login.');
        }

        if ($role === 'company') {
            $stmt = $db->prepare("UPDATE companies SET password = :pw WHERE email = :email");
            $stmt->execute([':pw' => $hash, ':email' => $email]);
            if ($stmt->rowCount() === 0) sendError('Email not found.', 404);
            sendSuccess(null, 'Password reset successfully. You can now login.');
        }

        if ($role === 'admin') {
            $stmt = $db->prepare("UPDATE admins SET password = :pw WHERE email = :email");
            $stmt->execute([':pw' => $hash, ':email' => $email]);
            if ($stmt->rowCount() === 0) sendError('Email not found.', 404);
            sendSuccess(null, 'Password reset successfully. You can now login.');
        }

        sendError('Invalid role specified.', 422);
    }

    // ── Private: admin login ──────────────────────────────────
    private function loginAdmin(string $email, string $password): void {
        $db   = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM admins WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $admin = $stmt->fetch();
        if (!$admin || !password_verify($password, $admin['password'])) sendError('Invalid admin credentials.', 401);
        $token = JWT::encode(['sub' => $admin['id'], 'role' => 'admin', 'name' => $admin['name']]);
        sendSuccess([
            'token' => $token,
            'admin' => ['id' => $admin['id'], 'name' => $admin['name'], 'email' => $admin['email'], 'role' => 'admin'],
        ], 'Admin login successful.');
    }
}
