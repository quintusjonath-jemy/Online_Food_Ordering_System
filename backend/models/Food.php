<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Food Model
 * Handles all food item CRUD operations
 */
class Food {
    private PDO    $db;
    private string $table = 'foods';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Get all foods with category name, optional search/filter/sort
     */
    public function getAll(array $params = []): array {
        $sql    = "SELECT f.*, c.name AS category_name FROM {$this->table} f LEFT JOIN categories c ON f.category_id = c.id";
        $where  = [];
        $values = [];

        if (!empty($params['search'])) {
            $where[]  = '(f.name LIKE ? OR f.description LIKE ?)';
            $values[] = '%' . $params['search'] . '%';
            $values[] = '%' . $params['search'] . '%';
        }
        if (!empty($params['category_id'])) {
            $where[]  = 'f.category_id = ?';
            $values[] = (int) $params['category_id'];
        }
        if (!empty($params['featured'])) {
            $where[]  = 'f.is_featured = 1';
        }

        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }

        // Sorting
        $sort  = $params['sort'] ?? 'newest';
        $sql  .= match ($sort) {
            'price_asc'  => ' ORDER BY f.price ASC',
            'price_desc' => ' ORDER BY f.price DESC',
            'rating'     => ' ORDER BY f.rating DESC',
            default      => ' ORDER BY f.created_at DESC',
        };

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);
        return $stmt->fetchAll();
    }

    /**
     * Get a single food item by ID
     */
    public function findById(int $id): ?array {
        $stmt = $this->db->prepare(
            "SELECT f.*, c.name AS category_name FROM {$this->table} f LEFT JOIN categories c ON f.category_id = c.id WHERE f.id = ?"
        );
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Create a new food item
     */
    public function create(array $data): array {
        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (category_id, name, description, price, image, stock, rating, is_featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            (int)   $data['category_id'],
                    $data['name'],
                    $data['description'] ?? '',
            (float) $data['price'],
                    $data['image']       ?? '',
            (int)   ($data['stock']      ?? 100),
            (float) ($data['rating']     ?? 4.50),
            (int)   ($data['is_featured'] ?? 0),
        ]);
        $id   = (int) $this->db->lastInsertId();
        $food = $this->findById($id);
        return ['success' => true, 'message' => 'Food item created successfully.', 'food' => $food];
    }

    /**
     * Update a food item
     */
    public function update(int $id, array $data): array {
        $fields = [];
        $values = [];

        $allowed = ['category_id', 'name', 'description', 'price', 'image', 'stock', 'rating', 'is_featured'];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            return ['success' => false, 'message' => 'No fields to update.'];
        }

        $values[] = $id;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);

        return ['success' => true, 'message' => 'Food item updated successfully.', 'food' => $this->findById($id)];
    }

    /**
     * Delete a food item
     */
    public function delete(int $id): array {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Food item deleted successfully.']
            : ['success' => false, 'message' => 'Food item not found.'];
    }

    /**
     * Count total food items
     */
    public function count(): int {
        $stmt = $this->db->query("SELECT COUNT(*) FROM {$this->table}");
        return (int) $stmt->fetchColumn();
    }

    /**
     * Get top popular foods based on order_items
     */
    public function getPopular(int $limit = 5): array {
        $stmt = $this->db->prepare(
            "SELECT f.id, f.name, f.price, f.image, f.rating, SUM(oi.quantity) AS total_sold
             FROM order_items oi
             JOIN {$this->table} f ON oi.food_id = f.id
             GROUP BY f.id
             ORDER BY total_sold DESC
             LIMIT ?"
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}
