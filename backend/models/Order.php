<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Order Model
 * Handles order creation, retrieval, and status updates
 */
class Order {
    private PDO    $db;
    private string $table      = 'orders';
    private string $itemsTable = 'order_items';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Create a new order from the user's cart
     */
    public function createFromCart(int $userId, array $cartItems, float $totalPrice, array $delivery): array {
        if (empty($cartItems)) {
            return ['success' => false, 'message' => 'Cart is empty.'];
        }

        $this->db->beginTransaction();
        try {
            // Insert order
            $stmt = $this->db->prepare(
                "INSERT INTO {$this->table} (user_id, total_price, delivery_address, phone, notes)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $userId,
                $totalPrice,
                $delivery['address'],
                $delivery['phone'],
                $delivery['notes'] ?? '',
            ]);
            $orderId = (int) $this->db->lastInsertId();

            // Insert each order item
            $itemStmt = $this->db->prepare(
                "INSERT INTO {$this->itemsTable} (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)"
            );
            foreach ($cartItems as $item) {
                $itemStmt->execute([$orderId, $item['food_id'], $item['quantity'], $item['price']]);
            }

            $this->db->commit();
            return ['success' => true, 'message' => 'Order placed successfully!', 'order_id' => $orderId];
        } catch (\Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Failed to place order: ' . $e->getMessage()];
        }
    }

    /**
     * Get orders for a specific user
     */
    public function getByUser(int $userId): array {
        $stmt = $this->db->prepare(
            "SELECT o.*, COUNT(oi.id) AS item_count
             FROM {$this->table} o
             LEFT JOIN {$this->itemsTable} oi ON oi.order_id = o.id
             WHERE o.user_id = ?
             GROUP BY o.id
             ORDER BY o.order_date DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all orders (admin)
     */
    public function getAll(array $params = []): array {
        $sql    = "SELECT o.*, u.name AS customer_name, u.email AS customer_email, COUNT(oi.id) AS item_count
                   FROM {$this->table} o
                   LEFT JOIN users u ON o.user_id = u.id
                   LEFT JOIN {$this->itemsTable} oi ON oi.order_id = o.id";
        $where  = [];
        $values = [];

        if (!empty($params['status'])) {
            $where[]  = 'o.status = ?';
            $values[] = $params['status'];
        }

        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' GROUP BY o.id ORDER BY o.order_date DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);
        return $stmt->fetchAll();
    }

    /**
     * Get a single order with its items
     */
    public function findById(int $id, ?int $userId = null): ?array {
        $sql    = "SELECT o.*, u.name AS customer_name FROM {$this->table} o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?";
        $values = [$id];
        if ($userId !== null) {
            $sql    .= ' AND o.user_id = ?';
            $values[] = $userId;
        }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($values);
        $order = $stmt->fetch();
        if (!$order) return null;

        // Fetch order items
        $stmt = $this->db->prepare(
            "SELECT oi.*, f.name AS food_name, f.image FROM {$this->itemsTable} oi
             LEFT JOIN foods f ON oi.food_id = f.id
             WHERE oi.order_id = ?"
        );
        $stmt->execute([$id]);
        $order['items'] = $stmt->fetchAll();
        return $order;
    }

    /**
     * Update order status (admin)
     */
    public function updateStatus(int $id, string $status): array {
        $allowed = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!in_array($status, $allowed, true)) {
            return ['success' => false, 'message' => 'Invalid status value.'];
        }
        $stmt = $this->db->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        return $stmt->rowCount() > 0
            ? ['success' => true, 'message' => 'Order status updated.']
            : ['success' => false, 'message' => 'Order not found.'];
    }

    /**
     * Count today's orders
     */
    public function countToday(): int {
        $stmt = $this->db->query("SELECT COUNT(*) FROM {$this->table} WHERE DATE(order_date) = CURDATE()");
        return (int) $stmt->fetchColumn();
    }

    /**
     * Get total revenue
     */
    public function getTotalRevenue(): float {
        $stmt = $this->db->query("SELECT COALESCE(SUM(total_price), 0) FROM {$this->table} WHERE status != 'cancelled'");
        return (float) $stmt->fetchColumn();
    }

    /**
     * Get recent orders for dashboard
     */
    public function getRecent(int $limit = 10): array {
        $stmt = $this->db->prepare(
            "SELECT o.id, o.total_price, o.status, o.order_date, u.name AS customer_name
             FROM {$this->table} o
             LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.order_date DESC
             LIMIT ?"
        );
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }

    /**
     * Get monthly revenue for the last 6 months
     */
    public function getMonthlyRevenue(): array {
        $stmt = $this->db->query(
            "SELECT DATE_FORMAT(order_date, '%b %Y') AS month, SUM(total_price) AS revenue
             FROM {$this->table}
             WHERE status != 'cancelled' AND order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(order_date, '%Y-%m')
             ORDER BY MIN(order_date) ASC"
        );
        return $stmt->fetchAll();
    }
}
