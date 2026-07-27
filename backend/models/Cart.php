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
     * Get all cart items for a user with food details and dynamic addon prices
     */
    public function getUserCart(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT c.id, c.quantity, c.selected_addons, f.id AS food_id, f.name, f.price, f.image, f.stock
             FROM {$this->table} c
             JOIN foods f ON c.food_id = f.id
             WHERE c.user_id = ?
             ORDER BY c.created_at DESC"
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        $items = [];
        $total = 0;

        foreach ($rows as $row) {
            $addons = json_decode($row['selected_addons'], true) ?? [];
            
            // Calculate total price of all selected addons
            $addonsPrice = 0;
            foreach ($addons as $addon) {
                $addonsPrice += (float)($addon['price'] ?? 0);
            }

            $basePrice = (float)$row['price'];
            $unitPrice = $basePrice + $addonsPrice;
            $subtotal = $unitPrice * (int)$row['quantity'];

            $items[] = [
                'id' => (int)$row['id'],
                'food_id' => (int)$row['food_id'],
                'name' => $row['name'],
                'image' => $row['image'],
                'stock' => (int)$row['stock'],
                'quantity' => (int)$row['quantity'],
                'base_price' => $basePrice,
                'price' => $unitPrice, // Unit price including addons
                'subtotal' => $subtotal,
                'selected_addons' => $addons
            ];

            $total += $subtotal;
        }

        return ['items' => $items, 'total' => $total, 'count' => count($items)];
    }

    /**
     * Add item to cart with selected addons
     */
    public function addItem(int $userId, int $foodId, int $quantity = 1, ?array $selectedAddons = null): array {
        // Check food availability
        $stmt = $this->db->prepare("SELECT stock FROM foods WHERE id = ?");
        $stmt->execute([$foodId]);
        $food = $stmt->fetch();
        if (!$food) {
            return ['success' => false, 'message' => 'Food item not found.'];
        }

        $addonsJson = $selectedAddons ? json_encode($selectedAddons) : null;

        // Upsert: insert or update quantity / addons
        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (user_id, food_id, quantity, selected_addons)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), selected_addons = VALUES(selected_addons)"
        );
        $stmt->execute([$userId, $foodId, $quantity, $addonsJson]);

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
