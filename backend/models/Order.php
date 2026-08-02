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
            // Calculate final price with coupons and points
            $couponCode = $delivery['coupon_code'] ?? null;
            $discountApplied = (float)($delivery['discount_applied'] ?? 0.00);
            $redeemPoints = (bool)($delivery['redeem_points'] ?? false);
            $pointsDeducted = 0;

            // Fetch user's current loyalty points
            $stmtUser = $this->db->prepare("SELECT loyalty_points FROM users WHERE id = ?");
            $stmtUser->execute([$userId]);
            $currentPoints = (int)$stmtUser->fetchColumn();

            if ($redeemPoints && $currentPoints > 0) {
                // $1 per 10 points
                $pointsDiscount = min($currentPoints / 10.0, $totalPrice - $discountApplied);
                $pointsDeducted = (int)($pointsDiscount * 10);
                $discountApplied += $pointsDiscount;
            }

            $finalPrice = max(0.00, $totalPrice - $discountApplied);

            // Insert order
            $stmt = $this->db->prepare(
                "INSERT INTO {$this->table} 
                 (user_id, total_price, delivery_address, phone, notes, payment_method, payment_status, transaction_reference, coupon_code, discount_applied)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $userId,
                $finalPrice,
                $delivery['address'],
                $delivery['phone'],
                $delivery['notes'] ?? '',
                $delivery['payment_method'] ?? 'cod',
                $delivery['payment_status'] ?? 'unpaid',
                $delivery['transaction_reference'] ?? null,
                $couponCode,
                $discountApplied
            ]);
            $orderId = (int) $this->db->lastInsertId();

            // Insert each order item
            $itemStmt = $this->db->prepare(
                "INSERT INTO {$this->itemsTable} (order_id, food_id, quantity, price, selected_addons) VALUES (?, ?, ?, ?, ?)"
            );
            foreach ($cartItems as $item) {
                $itemStmt->execute([
                    $orderId, 
                    $item['food_id'], 
                    $item['quantity'], 
                    $item['price'], 
                    json_encode($item['selected_addons'] ?? [])
                ]);
            }

            // Update user loyalty points: add 1 point per $10 spent
            $pointsEarned = (int)($finalPrice / 10);
            $pointsDiff = $pointsEarned - $pointsDeducted;

            $stmtUpdatePoints = $this->db->prepare("UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?");
            $stmtUpdatePoints->execute([$pointsDiff, $userId]);

            // Save user profile address & phone if empty
            $stmtUserCheck = $this->db->prepare("SELECT phone, address FROM users WHERE id = ?");
            $stmtUserCheck->execute([$userId]);
            $userProfile = $stmtUserCheck->fetch();
            if ($userProfile) {
                $updateFields = [];
                $updateParams = [];
                if (empty($userProfile['phone']) && !empty($delivery['phone'])) {
                    $updateFields[] = "phone = ?";
                    $updateParams[] = $delivery['phone'];
                }
                if (empty($userProfile['address']) && !empty($delivery['address'])) {
                    $updateFields[] = "address = ?";
                    $updateParams[] = $delivery['address'];
                }
                if (!empty($updateFields)) {
                    $updateParams[] = $userId;
                    $stmtProfileUpdate = $this->db->prepare("UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?");
                    $stmtProfileUpdate->execute($updateParams);
                }
            }

            $this->db->commit();
            return [
                'success' => true, 
                'message' => 'Order placed successfully!', 
                'order_id' => $orderId,
                'points_earned' => $pointsEarned,
                'points_deducted' => $pointsDeducted
            ];
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
            "SELECT o.*, 
                    (SELECT COUNT(*) FROM {$this->itemsTable} oi WHERE oi.order_id = o.id) AS item_count,
                    (SELECT GROUP_CONCAT(CONCAT(oi.quantity, 'x ', f.name) SEPARATOR ', ') 
                     FROM {$this->itemsTable} oi 
                     LEFT JOIN foods f ON oi.food_id = f.id 
                     WHERE oi.order_id = o.id) AS items_summary
             FROM {$this->table} o
             WHERE o.user_id = ?
             ORDER BY o.order_date DESC"
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Get all orders (admin)
     */
    public function getAll(array $params = []): array {
        $sql    = "SELECT o.*, u.name AS customer_name, u.email AS customer_email,
                          (SELECT COUNT(*) FROM {$this->itemsTable} oi WHERE oi.order_id = o.id) AS item_count,
                          (SELECT GROUP_CONCAT(CONCAT(oi.quantity, 'x ', f.name) SEPARATOR ', ') 
                           FROM {$this->itemsTable} oi 
                           LEFT JOIN foods f ON oi.food_id = f.id 
                           WHERE oi.order_id = o.id) AS items_summary
                   FROM {$this->table} o
                   LEFT JOIN users u ON o.user_id = u.id";
        $where  = [];
        $values = [];

        if (!empty($params['status'])) {
            $where[]  = 'o.status = ?';
            $values[] = $params['status'];
        }

        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY o.order_date DESC';

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
        $items = $stmt->fetchAll();
        
        // Decode selected addons for each item
        foreach ($items as &$item) {
            $item['selected_addons'] = json_decode($item['selected_addons'], true) ?? [];
        }
        
        $order['items'] = $items;
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
