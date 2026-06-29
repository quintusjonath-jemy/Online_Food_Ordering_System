<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Category Model
 * Handles category CRUD operations
 */
class Category {
    private PDO    $db;
    private string $table = 'categories';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /** Get all categories */
    public function getAll(): array {
        $stmt = $this->db->query(
            "SELECT c.*, COUNT(f.id) AS food_count
             FROM {$this->table} c
             LEFT JOIN foods f ON f.category_id = c.id
             GROUP BY c.id
             ORDER BY c.name ASC"
        );
        return $stmt->fetchAll();
    }

    /** Find by ID */
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /** Create a new category */
    public function create(string $name, string $icon = '🍽️'): array {
        // Check duplicate
        $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE name = ?");
        $stmt->execute([$name]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'Category already exists.'];
        }
        $stmt = $this->db->prepare("INSERT INTO {$this->table} (name, icon) VALUES (?, ?)");
        $stmt->execute([$name, $icon]);
        $id = (int) $this->db->lastInsertId();
        return ['success' => true, 'message' => 'Category created.', 'category' => $this->findById($id)];
    }

    /** Update a category */
    public function update(int $id, string $name, string $icon = ''): array {
        $stmt = $this->db->prepare("UPDATE {$this->table} SET name = ?, icon = ? WHERE id = ?");
        $stmt->execute([$name, $icon, $id]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Category updated.', 'category' => $this->findById($id)]
            : ['success' => false, 'message' => 'Category not found or no changes made.'];
    }

    /** Delete a category */
    public function delete(int $id): array {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Category deleted.']
            : ['success' => false, 'message' => 'Category not found.'];
    }
}
