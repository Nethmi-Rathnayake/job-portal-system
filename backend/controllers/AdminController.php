<?php
// ============================================================
// controllers/AdminController.php
// Admin-only: user mgmt, company mgmt, job mgmt, analytics
// ============================================================

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../models/UserModel.php';
require_once __DIR__ . '/../models/CompanyModel.php';
require_once __DIR__ . '/../models/JobModel.php';

class AdminController {
    private UserModel    $userModel;
    private CompanyModel $companyModel;
    private JobModel     $jobModel;

    public function __construct() {
        $this->userModel    = new UserModel();
        $this->companyModel = new CompanyModel();
        $this->jobModel     = new JobModel();
    }

    // ── GET /admin/stats ──────────────────────────────────────
    public function stats(): void {
        requireRole('admin');
        $stats = $this->jobModel->getAdminStats();

        // Add recent activity
        $db = \Database::getConnection();

        $recentJobs = $db->query(
            "SELECT j.id, j.title, c.company_name, j.created_at
             FROM jobs j JOIN companies c ON c.id = j.company_id
             ORDER BY j.created_at DESC LIMIT 5"
        )->fetchAll();

        $recentApps = $db->query(
            "SELECT a.id, a.status, a.applied_at,
                    u.name AS student_name, j.title AS job_title
             FROM applications a
             JOIN users u ON u.id = a.user_id
             JOIN jobs  j ON j.id = a.job_id
             ORDER BY a.applied_at DESC LIMIT 5"
        )->fetchAll();

        // Monthly job posts (last 6 months)
        $monthlyJobs = $db->query(
            "SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
             FROM jobs
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month ORDER BY month ASC"
        )->fetchAll();

        sendSuccess([
            'stats'        => $stats,
            'recent_jobs'  => $recentJobs,
            'recent_apps'  => $recentApps,
            'monthly_jobs' => $monthlyJobs,
        ]);
    }

    // ── GET /admin/users ──────────────────────────────────────
    public function users(): void {
        requireRole('admin');
        $page   = (int) ($_GET['page'] ?? 1);
        $search = $_GET['search'] ?? '';
        sendSuccess($this->userModel->getAllUsers($page, $search));
    }

    // ── PATCH /admin/users/{id}/toggle ────────────────────────
    public function toggleUser(int $id): void {
        requireRole('admin');
        $this->userModel->toggleActive($id);
        sendSuccess(null, 'User status toggled.');
    }

    // ── DELETE /admin/users/{id} ──────────────────────────────
    public function deleteUser(int $id): void {
        requireRole('admin');
        $this->userModel->delete($id);
        sendSuccess(null, 'User deleted.');
    }

    // ── GET /admin/companies ──────────────────────────────────
    public function companies(): void {
        requireRole('admin');
        $page   = (int) ($_GET['page'] ?? 1);
        $result = $this->companyModel->getAllForAdmin($page);
        sendSuccess($result);
    }

    // ── PATCH /admin/companies/{id}/verify ────────────────────
    public function verifyCompany(int $id): void {
        requireRole('admin');
        $this->companyModel->toggleVerified($id);
        sendSuccess(null, 'Company verification status updated.');
    }

    // ── DELETE /admin/companies/{id} ──────────────────────────
    public function deleteCompany(int $id): void {
        requireRole('admin');
        $this->companyModel->delete($id);
        sendSuccess(null, 'Company deleted.');
    }

    // ── GET /admin/jobs ───────────────────────────────────────
    public function jobs(): void {
        requireRole('admin');
        $page    = (int) ($_GET['page'] ?? 1);
        $filters = ['search' => $_GET['search'] ?? ''];
        // Admin sees all jobs (we bypass is_active filter by calling model directly)
        $db     = \Database::getConnection();
        $search = $filters['search'];
        $limit  = DEFAULT_PAGE_SIZE;
        $offset = ($page - 1) * $limit;

        $where  = $search ? "WHERE j.title LIKE :s OR c.company_name LIKE :s" : '';
        $params = $search ? [':s' => "%$search%"] : [];

        $total = $db->prepare("SELECT COUNT(*) FROM jobs j JOIN companies c ON c.id = j.company_id $where");
        $total->execute($params);

        $sql = "SELECT j.id, j.title, j.type, j.location, j.is_active, j.created_at,
                       c.id AS company_id, c.company_name
                FROM jobs j JOIN companies c ON c.id = j.company_id
                $where ORDER BY j.created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        sendSuccess([
            'jobs'  => $stmt->fetchAll(),
            'total' => (int) $total->fetchColumn(),
            'page'  => $page,
        ]);
    }

    // ── DELETE /admin/jobs/{id} ───────────────────────────────
    public function deleteJob(int $id): void {
        requireRole('admin');
        $this->jobModel->adminDelete($id);
        sendSuccess(null, 'Job removed.');
    }

    // ── PATCH /admin/jobs/{id}/toggle ─────────────────────────
    public function toggleJob(int $id): void {
        requireRole('admin');
        $db   = \Database::getConnection();
        $stmt = $db->prepare("UPDATE jobs SET is_active = NOT is_active WHERE id = :id");
        $stmt->execute([':id' => $id]);
        sendSuccess(null, 'Job visibility toggled.');
    }
}
