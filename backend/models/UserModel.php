<?php
// ============================================================
// models/UserModel.php
// Data-access layer for the `users` table
// ============================================================

require_once __DIR__ . '/../config/database.php';

class UserModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // ── Create ───────────────────────────────────────────────
    public function create(array $data): int|false {
        $sql = "INSERT INTO users (name, email, password, role, phone, location)
                VALUES (:name, :email, :password, :role, :phone, :location)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':name'     => $data['name'],
            ':email'    => $data['email'],
            ':password' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
            ':role'     => $data['role'] ?? 'student',
            ':phone'    => $data['phone']    ?? null,
            ':location' => $data['location'] ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    // ── Find by email ────────────────────────────────────────
    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // ── Find by ID ───────────────────────────────────────────
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // ── Public profile (no password) ─────────────────────────
    public function getProfile(int $id): ?array {
        $sql = "SELECT id, name, email, phone, location, bio, skills,
                       profile_image, created_at
                FROM users WHERE id = :id AND is_active = 1 LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    // ── Update profile ───────────────────────────────────────
    public function updateProfile(int $id, array $data): bool {
        $fields = [];
        $params = [':id' => $id];

        $allowed = ['name', 'phone', 'location', 'bio', 'skills'];
        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $sql  = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    // ── Update profile image ──────────────────────────────────
    public function updateProfileImage(int $id, string $imagePath): bool {
        $stmt = $this->db->prepare("UPDATE users SET profile_image = :img WHERE id = :id");
        return $stmt->execute([':img' => $imagePath, ':id' => $id]);
    }

    // ── Change password ───────────────────────────────────────
    public function updatePassword(int $id, string $newPassword): bool {
        $hashed = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $this->db->prepare("UPDATE users SET password = :pw WHERE id = :id");
        return $stmt->execute([':pw' => $hashed, ':id' => $id]);
    }

    // ── Email exists? ─────────────────────────────────────────
    public function emailExists(string $email): bool {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return (bool) $stmt->fetch();
    }

    // ── Admin: all users ─────────────────────────────────────
    public function getAllUsers(int $page = 1, string $search = ''): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $where  = $search ? "WHERE (name LIKE :search OR email LIKE :search)" : '';
        $params = $search ? [':search' => "%$search%"] : [];

        $total = $this->db->prepare("SELECT COUNT(*) FROM users $where");
        $total->execute($params);

        $sql  = "SELECT id, name, email, role, location, is_active, created_at
                 FROM users $where ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);

        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'users' => $stmt->fetchAll(),
            'total' => (int) $total->fetchColumn(),
            'page'  => $page,
        ];
    }

    // ── Admin: toggle active ──────────────────────────────────
    public function toggleActive(int $id): bool {
        $stmt = $this->db->prepare("UPDATE users SET is_active = NOT is_active WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    // ── Admin: delete user ────────────────────────────────────
    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
