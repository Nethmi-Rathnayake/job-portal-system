<?php
// ============================================================
// models/CompanyModel.php
// Data-access layer for the `companies` table
// ============================================================

require_once __DIR__ . '/../config/database.php';

class CompanyModel {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(array $data): int {
        $sql = "INSERT INTO companies
                    (company_name, email, password, description, website, location, industry)
                VALUES
                    (:company_name, :email, :password, :description, :website, :location, :industry)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':company_name' => $data['company_name'],
            ':email'        => $data['email'],
            ':password'     => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]),
            ':description'  => $data['description'] ?? null,
            ':website'      => $data['website']      ?? null,
            ':location'     => $data['location']     ?? null,
            ':industry'     => $data['industry']     ?? null,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT * FROM companies WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch() ?: null;
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM companies WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function getPublicProfile(int $id): ?array {
        $sql = "SELECT id, company_name, email, description, logo, website,
                       location, industry, founded_year, employee_count, is_verified, created_at
                FROM companies WHERE id = :id AND is_active = 1 LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $params = [':id' => $id];

        $allowed = ['company_name', 'description', 'website', 'location',
                    'industry', 'phone', 'founded_year', 'employee_count'];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $sql  = "UPDATE companies SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function updateLogo(int $id, string $logoPath): bool {
        $stmt = $this->db->prepare("UPDATE companies SET logo = :logo WHERE id = :id");
        return $stmt->execute([':logo' => $logoPath, ':id' => $id]);
    }

    public function emailExists(string $email): bool {
        $stmt = $this->db->prepare("SELECT id FROM companies WHERE email = :email LIMIT 1");
        $stmt->execute([':email' => $email]);
        return (bool) $stmt->fetch();
    }

    // Returns list of companies with job count
    public function getAllPublic(int $page = 1, string $search = ''): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $where  = $search ? "WHERE (c.company_name LIKE :s OR c.industry LIKE :s OR c.location LIKE :s)" : '';
        $params = $search ? [':s' => "%$search%"] : [];

        $countSql = "SELECT COUNT(*) FROM companies c $where";
        $countStmt = $this->db->prepare($countSql);
        $countStmt->execute($params);

        $sql = "SELECT c.id, c.company_name, c.logo, c.location, c.industry,
                       c.is_verified, c.website,
                       COUNT(j.id) AS job_count
                FROM companies c
                LEFT JOIN jobs j ON j.company_id = c.id AND j.is_active = 1
                $where
                GROUP BY c.id
                ORDER BY c.is_verified DESC, job_count DESC
                LIMIT :limit OFFSET :offset";

        $stmt = $this->db->prepare($sql);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return [
            'companies' => $stmt->fetchAll(),
            'total'     => (int) $countStmt->fetchColumn(),
            'page'      => $page,
        ];
    }

    // Admin: all companies
    public function getAllForAdmin(int $page = 1): array {
        ['limit' => $limit, 'offset' => $offset] = paginate($page);

        $total = $this->db->query("SELECT COUNT(*) FROM companies")->fetchColumn();

        $sql = "SELECT id, company_name, email, location, industry,
                       is_verified, is_active, created_at
                FROM companies ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();

        return ['companies' => $stmt->fetchAll(), 'total' => (int) $total];
    }

    public function toggleVerified(int $id): bool {
        $stmt = $this->db->prepare("UPDATE companies SET is_verified = NOT is_verified WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare("DELETE FROM companies WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }
}
