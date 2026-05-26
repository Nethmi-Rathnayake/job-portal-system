<?php
require_once __DIR__ . '/../config/database.php';

class SavedJobModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function save(int $userId, int $jobId): bool {
        if ($this->isSaved($userId, $jobId)) return false;
        $stmt = $this->db->prepare("INSERT INTO saved_jobs (user_id, job_id) VALUES (:uid, :jid)");
        return $stmt->execute([':uid' => $userId, ':jid' => $jobId]);
    }

    public function unsave(int $userId, int $jobId): bool {
        $stmt = $this->db->prepare("DELETE FROM saved_jobs WHERE user_id = :uid AND job_id = :jid");
        return $stmt->execute([':uid' => $userId, ':jid' => $jobId]);
    }

    public function isSaved(int $userId, int $jobId): bool {
        $stmt = $this->db->prepare("SELECT id FROM saved_jobs WHERE user_id = :uid AND job_id = :jid LIMIT 1");
        $stmt->execute([':uid' => $userId, ':jid' => $jobId]);
        return (bool) $stmt->fetch();
    }

    public function getByUser(int $userId, int $page = 1): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);
        $total = $this->db->prepare("SELECT COUNT(*) FROM saved_jobs WHERE user_id = :uid");
        $total->execute([':uid' => $userId]);
        $sql = "SELECT sj.id AS saved_id, sj.saved_at, j.id, j.title, j.type, j.location,
                j.salary_min, j.salary_max, c.id AS company_id, c.company_name, c.logo
                FROM saved_jobs sj
                JOIN jobs j ON j.id = sj.job_id
                JOIN companies c ON c.id = j.company_id
                WHERE sj.user_id = :uid LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':uid', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return ['saved_jobs' => $stmt->fetchAll(), 'total' => (int) $total->fetchColumn()];
    }
}