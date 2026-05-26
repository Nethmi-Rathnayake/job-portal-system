<?php
// ============================================================
// models/ResumeModel.php
// Data-access layer for the `resumes` table
// ============================================================

require_once __DIR__ . '/../config/database.php';

class ResumeModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(int $userId, string $fileName, string $filePath, int $fileSize): int {
        $this->db->prepare("UPDATE resumes SET is_primary = 0 WHERE user_id = :uid")
                 ->execute([':uid' => $userId]);

        $stmt = $this->db->prepare(
            "INSERT INTO resumes (user_id, file_name, file_path, file_size, is_primary)
             VALUES (:uid, :name, :path, :size, 1)"
        );
        $stmt->execute([
            ':uid'  => $userId,
            ':name' => $fileName,
            ':path' => $filePath,
            ':size' => $fileSize,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM resumes WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT * FROM resumes WHERE user_id = :uid ORDER BY uploaded_at DESC"
        );
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function getPrimary(int $userId): ?array {
        $stmt = $this->db->prepare(
            "SELECT * FROM resumes WHERE user_id = :uid AND is_primary = 1 LIMIT 1"
        );
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetch() ?: null;
    }

    public function setPrimary(int $id, int $userId): bool {
        $this->db->prepare("UPDATE resumes SET is_primary = 0 WHERE user_id = :uid")
                 ->execute([':uid' => $userId]);
        $stmt = $this->db->prepare(
            "UPDATE resumes SET is_primary = 1 WHERE id = :id AND user_id = :uid"
        );
        return $stmt->execute([':id' => $id, ':uid' => $userId]);
    }

    public function delete(int $id, int $userId): ?string {
        $resume = $this->findById($id);
        if (!$resume || $resume['user_id'] !== $userId) return null;

        $this->db->prepare("DELETE FROM resumes WHERE id = :id")->execute([':id' => $id]);
        return $resume['file_path'];
    }
}