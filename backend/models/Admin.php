<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Admin Model
 * Handles all administrator-related database operations
 */
class Admin {
    private PDO    $db;
    private string $table = 'admins';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
      * Authenticate an admin by email and password
      */
    public function login(string $email, string $password): array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        $admin = $stmt->fetch();

        if (!$admin || !password_verify($password, $admin['password'])) {
            return ['success' => false, 'message' => 'Invalid email or password.'];
        }

        $token = createJWT([
            'id'    => $admin['id'],
            'email' => $admin['email'],
            'role'  => 'admin',
            'name'  => $admin['name']
        ]);
        unset($admin['password']);
        $admin['role'] = 'admin'; // Append role so frontend has it

        return [
            'success' => true,
            'message' => 'Login successful!',
            'token'   => $token,
            'user'    => $admin
        ];
    }

    /**
      * Find admin by ID
      */
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, name, email, phone, address, created_at FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $admin = $stmt->fetch();
        if (!$admin) return null;
        $admin['role'] = 'admin'; // Append role so frontend has it
        return $admin;
    }
}
