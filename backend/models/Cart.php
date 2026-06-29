<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Cart Model
 * Manages the shopping cart for authenticated users
 */
class Cart {
    private PDO    $db;
    private string $table = 'cart';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Get all cart items for a user with food details
     */
    public function getUserCart(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT c.id, c.quantity, f.id AS food_id, f.name, f.price, f.image, f.stock,
                    (f.price * c.quantity) AS subtotal
             FROM {$this->table} c
             JOIN foods f ON c.food_id = f.id
             WHERE c.user_id = ?
             ORDER BY c.created_at DESC"
        );
        $stmt->execute([$userId]);
        $items = $stmt->fetchAll();

        $total = array_reduce($items, fn($carry, $item) => $carry + $item['subtotal'], 0);

        return ['items' => $items, 'total' => $total, 'count' => count($items)];
    }

    /**
     * Add item to cart (or increment quantity if exists)
     */
    public function addItem(int $userId, int $foodId, int $quantity = 1): array {
        // Check food availability
        $stmt = $this->db->prepare("SELECT stock FROM foods WHERE id = ?");
        $stmt->execute([$foodId]);
        $food = $stmt->fetch();
        if (!$food) {
            return ['success' => false, 'message' => 'Food item not found.'];
        }

        // Upsert: insert or update quantity
        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (user_id, food_id, quantity)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)"
        );
        $stmt->execute([$userId, $foodId, $quantity]);

        return ['success' => true, 'message' => 'Item added to cart.'];
    }

    /**
     * Set the exact quantity for a cart item
     */
    public function updateQuantity(int $userId, int $cartItemId, int $quantity): array {
        if ($quantity <= 0) {
            return $this->removeItem($userId, $cartItemId);
        }
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} SET quantity = ? WHERE id = ? AND user_id = ?"
        );
        $stmt->execute([$quantity, $cartItemId, $userId]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Cart updated.']
            : ['success' => false, 'message' => 'Cart item not found.'];
    }

    /**
     * Remove a specific item from cart
     */
    public function removeItem(int $userId, int $cartItemId): array {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ? AND user_id = ?");
        $stmt->execute([$cartItemId, $userId]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Item removed from cart.']
            : ['success' => false, 'message' => 'Cart item not found.'];
    }

    /**
     * Clear entire cart for a user
     */
    public function clearCart(int $userId): void {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE user_id = ?");
        $stmt->execute([$userId]);
    }

    /**
     * Count total items in cart (sum of quantities)
     */
    public function countItems(int $userId): int {
        $stmt = $this->db->prepare("SELECT COALESCE(SUM(quantity), 0) FROM {$this->table} WHERE user_id = ?");
        $stmt->execute([$userId]);
        return (int) $stmt->fetchColumn();
    }
}
