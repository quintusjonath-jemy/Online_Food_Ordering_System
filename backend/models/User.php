<?php
require_once __DIR__ . '/../config/database.php';

/**
 * User Model
 * Handles all user-related database operations
 */
class User {
    private PDO    $db;
    private string $table = 'users';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Register a new customer
     */
    public function register(string $name, string $email, string $password, string $phone = '', string $address = ''): array {
        // Check if email already exists
        $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'An account with this email already exists.'];
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, 'customer')"
        );
        $stmt->execute([$name, $email, $hashedPassword, $phone, $address]);
        $userId = (int) $this->db->lastInsertId();

        $user = $this->findById($userId);
        $token = createJWT(['id' => $userId, 'email' => $email, 'role' => 'customer', 'name' => $name]);

        return ['success' => true, 'message' => 'Registration successful!', 'token' => $token, 'user' => $user];
    }

    /**
     * Authenticate a user by email and password
     */
    public function login(string $email, string $password): array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Invalid email or password.'];
        }

        $token = createJWT(['id' => $user['id'], 'email' => $user['email'], 'role' => $user['role'], 'name' => $user['name']]);
        unset($user['password']);

        return ['success' => true, 'message' => 'Login successful!', 'token' => $token, 'user' => $user];
    }

    /**
     * Find user by ID (without password)
     */
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, name, email, phone, address, role, loyalty_points, created_at FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Get all customers (admin only)
     */
    public function getAll(): array {
        $stmt = $this->db->query("SELECT id, name, email, phone, address, role, created_at FROM {$this->table} ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    /**
     * Update user profile
     */
    public function update(int $id, array $data): array {
        $fields = [];
        $values = [];

        if (!empty($data['name']))    { $fields[] = 'name = ?';    $values[] = $data['name']; }
        if (!empty($data['phone']))   { $fields[] = 'phone = ?';   $values[] = $data['phone']; }
        if (!empty($data['address'])) { $fields[] = 'address = ?'; $values[] = $data['address']; }

        // Password change
        if (!empty($data['password'])) {
            $fields[] = 'password = ?';
            $values[] = password_hash($data['password'], PASSWORD_BCRYPT);
        }

        if (empty($fields)) {
            return ['success' => false, 'message' => 'No fields to update.'];
        }

        $values[] = $id;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        return ['success' => true, 'message' => 'Profile updated successfully.', 'user' => $this->findById($id)];
    }

    /**
     * Delete a user (admin only)
     */
    public function delete(int $id): array {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ? AND role != 'admin'");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'User deleted successfully.']
            : ['success' => false, 'message' => 'User not found or cannot delete admin.'];
    }

    /**
     * Count total customers
     */
    public function countCustomers(): int {
        $stmt = $this->db->query("SELECT COUNT(*) FROM {$this->table} WHERE role = 'customer'");
        return (int) $stmt->fetchColumn();
    }
}
