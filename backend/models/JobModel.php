<?php
// ============================================================
// models/JobModel.php
// Data-access layer for the `jobs` table
// ============================================================

require_once __DIR__ . '/../config/database.php';

class JobModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // ── Create job ───────────────────────────────────────────
    public function create(int $companyId, array $data): int {
        $sql = "INSERT INTO jobs
                    (company_id, title, description, requirements, responsibilities,
                     salary_min, salary_max, salary_type, location, type,
                     experience_level, category, deadline)
                VALUES
                    (:company_id, :title, :description, :requirements, :responsibilities,
                     :salary_min, :salary_max, :salary_type, :location, :type,
                     :experience_level, :category, :deadline)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':company_id'       => $companyId,
            ':title'            => $data['title'],
            ':description'      => $data['description'],
            ':requirements'     => $data['requirements']     ?? null,
            ':responsibilities' => $data['responsibilities'] ?? null,
            ':salary_min'       => $data['salary_min']       ?? null,
            ':salary_max'       => $data['salary_max']       ?? null,
            ':salary_type'      => $data['salary_type']      ?? 'monthly',
            ':location'         => $data['location']         ?? null,
            ':type'             => $data['type']             ?? 'full-time',
            ':experience_level' => $data['experience_level'] ?? 'any',
            ':category'         => $data['category']         ?? null,
            ':deadline'         => $data['deadline']         ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    // ── Get single job (with company info) ───────────────────
    public function findById(int $id): ?array {
        $sql = "SELECT j.*,
                       c.company_name, c.logo, c.location AS company_location,
                       c.industry, c.is_verified, c.website
                FROM jobs j
                JOIN companies c ON c.id = j.company_id
                WHERE j.id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    // ── Increment view counter ────────────────────────────────
    public function incrementViews(int $id): void {
        $this->db->prepare("UPDATE jobs SET views = views + 1 WHERE id = :id")
                 ->execute([':id' => $id]);
    }

    // ── List jobs with filters + pagination ──────────────────
    public function getAll(array $filters = [], int $page = 1): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $conditions = ['j.is_active = 1'];
        $params     = [];

        if (!empty($filters['search'])) {
            $conditions[] = "(j.title LIKE :search OR c.company_name LIKE :search OR j.location LIKE :search)";
            $params[':search'] = '%' . $filters['search'] . '%';
        }
        if (!empty($filters['type'])) {
            $conditions[] = "j.type = :type";
            $params[':type'] = $filters['type'];
        }
        if (!empty($filters['location'])) {
            $conditions[] = "j.location LIKE :location";
            $params[':location'] = '%' . $filters['location'] . '%';
        }
        if (!empty($filters['category'])) {
            $conditions[] = "j.category = :category";
            $params[':category'] = $filters['category'];
        }
        if (!empty($filters['experience_level'])) {
            $conditions[] = "j.experience_level = :exp";
            $params[':exp'] = $filters['experience_level'];
        }
        if (!empty($filters['company_id'])) {
            $conditions[] = "j.company_id = :company_id";
            $params[':company_id'] = (int) $filters['company_id'];
        }

        $where = 'WHERE ' . implode(' AND ', $conditions);

        // Total count
        $countSql  = "SELECT COUNT(*) FROM jobs j JOIN companies c ON c.id = j.company_id $where";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);

        $sql = "SELECT j.id, j.title, j.type, j.location, j.salary_min, j.salary_max,
                       j.salary_type, j.experience_level, j.category, j.deadline,
                       j.views, j.created_at,
                       c.id AS company_id, c.company_name, c.logo, c.is_verified
                FROM jobs j
                JOIN companies c ON c.id = j.company_id
                $where
                ORDER BY j.created_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'jobs'   => $stmt->fetchAll(),
            'total'  => (int) $countStmt->fetchColumn(),
            'page'   => $page,
            'pages'  => (int) ceil($countStmt->fetchColumn() / $limit),
        ];
    }

    // ── Featured / latest jobs (home page) ───────────────────
    public function getFeatured(int $limit = 6): array {
        $sql = "SELECT j.id, j.title, j.type, j.location, j.salary_min, j.salary_max,
                       j.created_at,
                       c.id AS company_id, c.company_name, c.logo, c.is_verified
                FROM jobs j
                JOIN companies c ON c.id = j.company_id
                WHERE j.is_active = 1
                ORDER BY j.created_at DESC
                LIMIT :limit";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    // ── Company's own jobs ────────────────────────────────────
    public function getByCompany(int $companyId, int $page = 1): array {
        return $this->getAll(['company_id' => $companyId], $page);
    }

    // ── Update ────────────────────────────────────────────────
    public function update(int $id, int $companyId, array $data): bool {
        $fields = [];
        $params = [':id' => $id, ':company_id' => $companyId];

        $allowed = ['title', 'description', 'requirements', 'responsibilities',
                    'salary_min', 'salary_max', 'salary_type', 'location', 'type',
                    'experience_level', 'category', 'deadline', 'is_active'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $sql  = "UPDATE jobs SET " . implode(', ', $fields)
              . " WHERE id = :id AND company_id = :company_id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // ── Delete (company-scoped) ───────────────────────────────
    public function delete(int $id, int $companyId): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM jobs WHERE id = :id AND company_id = :company_id"
        );
        return $stmt->execute([':id' => $id, ':company_id' => $companyId]);
    }

    // ── Admin delete ──────────────────────────────────────────
    public function adminDelete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM jobs WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Stats for company dashboard ───────────────────────────
    public function getCompanyStats(int $companyId): array {
        $totalJobs   = $this->db->prepare("SELECT COUNT(*) FROM jobs WHERE company_id = :id");
        $activeJobs  = $this->db->prepare("SELECT COUNT(*) FROM jobs WHERE company_id = :id AND is_active = 1");
        $totalApps   = $this->db->prepare(
            "SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.company_id = :id"
        );

        $totalJobs->execute([':id'  => $companyId]);
        $activeJobs->execute([':id' => $companyId]);
        $totalApps->execute([':id'  => $companyId]);

        return [
            'total_jobs'   => (int) $totalJobs->fetchColumn(),
            'active_jobs'  => (int) $activeJobs->fetchColumn(),
            'total_applications' => (int) $totalApps->fetchColumn(),
        ];
    }

    // ── Admin analytics ───────────────────────────────────────
    public function getAdminStats(): array {
        return [
            'total_jobs'     => (int) $this->db->query("SELECT COUNT(*) FROM jobs")->fetchColumn(),
            'active_jobs'    => (int) $this->db->query("SELECT COUNT(*) FROM jobs WHERE is_active=1")->fetchColumn(),
            'total_users'    => (int) $this->db->query("SELECT COUNT(*) FROM users")->fetchColumn(),
            'total_companies'=> (int) $this->db->query("SELECT COUNT(*) FROM companies")->fetchColumn(),
            'total_apps'     => (int) $this->db->query("SELECT COUNT(*) FROM applications")->fetchColumn(),
        ];
    }
}
