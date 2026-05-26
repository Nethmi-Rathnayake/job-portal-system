<?php
// ============================================================
// models/ApplicationModel.php
// Data-access layer for job applications
// ============================================================

require_once __DIR__ . '/../config/database.php';

class ApplicationModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // ── Apply for a job ──────────────────────────────────────
    public function create(int $userId, int $jobId, ?int $resumeId, ?string $coverLetter): int|false {
        if ($this->hasApplied($userId, $jobId)) {
            return false;
        }

        // Auto-attach primary resume if no resume specified
        if (!$resumeId) {
            $stmt = $this->db->prepare(
                "SELECT id FROM resumes WHERE user_id = :uid AND is_primary = 1 LIMIT 1"
            );
            $stmt->execute([':uid' => $userId]);
            $resume = $stmt->fetch();
            if ($resume) $resumeId = $resume['id'];
        }

        $stmt = $this->db->prepare(
            "INSERT INTO applications (user_id, job_id, resume_id, cover_letter)
             VALUES (:user_id, :job_id, :resume_id, :cover_letter)"
        );
        $stmt->execute([
            ':user_id'      => $userId,
            ':job_id'       => $jobId,
            ':resume_id'    => $resumeId,
            ':cover_letter' => $coverLetter,
        ]);

        return (int) $this->db->lastInsertId();
    }

    // ── Check if already applied ─────────────────────────────
    public function hasApplied(int $userId, int $jobId): bool {
        $stmt = $this->db->prepare(
            "SELECT id FROM applications WHERE user_id = :uid AND job_id = :jid LIMIT 1"
        );
        $stmt->execute([':uid' => $userId, ':jid' => $jobId]);
        return (bool) $stmt->fetch();
    }

    // ── Get single application ────────────────────────────────
    public function findById(int $id): ?array {
        $sql = "SELECT a.*,
                       u.name AS student_name, u.email AS student_email,
                       u.phone AS student_phone, u.profile_image,
                       j.title AS job_title, j.type AS job_type, j.location AS job_location,
                       c.company_name, c.logo,
                       r.file_path AS resume_path, r.file_name AS resume_name
                FROM applications a
                JOIN users u     ON u.id = a.user_id
                JOIN jobs j      ON j.id = a.job_id
                JOIN companies c ON c.id = j.company_id
                LEFT JOIN resumes r ON r.id = a.resume_id
                WHERE a.id = :id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    // ── Student: my applications ─────────────────────────────
    public function getByUser(int $userId, int $page = 1): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $total = $this->db->prepare(
            "SELECT COUNT(*) FROM applications WHERE user_id = :uid"
        );
        $total->execute([':uid' => $userId]);

        $sql = "SELECT a.id, a.status, a.applied_at,
                       j.id AS job_id, j.title, j.type, j.location,
                       c.id AS company_id, c.company_name, c.logo
                FROM applications a
                JOIN jobs j      ON j.id = a.job_id
                JOIN companies c ON c.id = j.company_id
                WHERE a.user_id = :uid
                ORDER BY a.applied_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':uid',    $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'applications' => $stmt->fetchAll(),
            'total'        => (int) $total->fetchColumn(),
            'page'         => $page,
        ];
    }

    // ── Company: applications for a specific job ──────────────
    public function getByJob(int $jobId, int $companyId, int $page = 1): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $check = $this->db->prepare(
            "SELECT id FROM jobs WHERE id = :jid AND company_id = :cid"
        );
        $check->execute([':jid' => $jobId, ':cid' => $companyId]);
        if (!$check->fetch()) return [];

        $total = $this->db->prepare(
            "SELECT COUNT(*) FROM applications WHERE job_id = :jid"
        );
        $total->execute([':jid' => $jobId]);

        $sql = "SELECT a.id, a.status, a.cover_letter, a.applied_at,
                       u.id AS user_id, u.name AS student_name, u.email AS student_email,
                       u.phone, u.profile_image, u.skills,
                       r.file_path AS resume_path, r.file_name AS resume_name
                FROM applications a
                JOIN users u ON u.id = a.user_id
                LEFT JOIN resumes r ON r.id = a.resume_id
                WHERE a.job_id = :jid
                ORDER BY a.applied_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':jid',    $jobId,  PDO::PARAM_INT);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'applications' => $stmt->fetchAll(),
            'total'        => (int) $total->fetchColumn(),
            'page'         => $page,
        ];
    }

    // ── Company: all applicants across all jobs ── FIXED ─────
    public function getByCompany(int $companyId, int $page = 1, string $status = ''): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $statusCond = $status ? "AND a.status = :status" : '';
        $params     = [':cid' => $companyId];
        if ($status) $params[':status'] = $status;

        $total = $this->db->prepare(
            "SELECT COUNT(*) FROM applications a
             JOIN jobs j ON j.id = a.job_id
             WHERE j.company_id = :cid $statusCond"
        );
        $total->execute($params);

        // ── FIXED: Added resume JOIN ──────────────────────────
        $sql = "SELECT a.id, a.status, a.applied_at, a.cover_letter,
                       j.id AS job_id, j.title AS job_title,
                       u.id AS user_id, u.name AS student_name,
                       u.email AS student_email, u.phone, u.skills,
                       u.profile_image,
                       r.file_path AS resume_path,
                       r.file_name AS resume_name
                FROM applications a
                JOIN jobs j     ON j.id  = a.job_id
                JOIN users u    ON u.id  = a.user_id
                LEFT JOIN resumes r ON r.id = a.resume_id
                WHERE j.company_id = :cid $statusCond
                ORDER BY a.applied_at DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'applications' => $stmt->fetchAll(),
            'total'        => (int) $total->fetchColumn(),
        ];
    }

    // ── Update status (company only) ──────────────────────────
    public function updateStatus(int $appId, int $companyId, string $status, ?string $notes = null): bool {
        $sql = "UPDATE applications a
                JOIN jobs j ON j.id = a.job_id
                SET a.status = :status, a.company_notes = :notes
                WHERE a.id = :id AND j.company_id = :cid";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':status' => $status,
            ':notes'  => $notes,
            ':id'     => $appId,
            ':cid'    => $companyId,
        ]);
    }

    // ── Withdraw application (student) ────────────────────────
    public function withdraw(int $appId, int $userId): bool {
        $stmt = $this->db->prepare(
            "DELETE FROM applications WHERE id = :id AND user_id = :uid AND status = 'pending'"
        );
        return $stmt->execute([':id' => $appId, ':uid' => $userId]);
    }

    // ── Student dashboard stats ───────────────────────────────
    public function getUserStats(int $userId): array {
        $total    = $this->db->prepare("SELECT COUNT(*) FROM applications WHERE user_id = :id");
        $pending  = $this->db->prepare("SELECT COUNT(*) FROM applications WHERE user_id = :id AND status = 'pending'");
        $accepted = $this->db->prepare("SELECT COUNT(*) FROM applications WHERE user_id = :id AND status = 'accepted'");

        $total->execute([':id'    => $userId]);
        $pending->execute([':id'  => $userId]);
        $accepted->execute([':id' => $userId]);

        return [
            'total_applications' => (int) $total->fetchColumn(),
            'pending'            => (int) $pending->fetchColumn(),
            'accepted'           => (int) $accepted->fetchColumn(),
        ];
    }
}