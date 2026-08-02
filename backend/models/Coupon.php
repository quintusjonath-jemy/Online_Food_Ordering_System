<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Coupon Model
 * Handles promo coupon validation and calculations
 */
class Coupon {
    private PDO $db;
    private string $table = 'coupons';

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Find coupon by code
     */
    public function findByCode(string $code): ?array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE code = ? AND active = 1");
        $stmt->execute([strtoupper(trim($code))]);
        return $stmt->fetch() ?: null;
    }

    /**
     * Validate a coupon code against subtotal
     */
    public function validate(string $code, float $subtotal): array {
        $coupon = $this->findByCode($code);

        if (!$coupon) {
            return [
                'success' => false,
                'message' => 'Invalid or inactive coupon code.'
            ];
        }

        // Check expiry date
        $expiry = strtotime($coupon['expiry_date']);
        if ($expiry < time() && date('Y-m-d', $expiry) !== date('Y-m-d')) {
            return [
                'success' => false,
                'message' => 'This coupon code has expired.'
            ];
        }

        // Check minimum order value
        if ($subtotal < (float)$coupon['min_order_value']) {
            return [
                'success' => false,
                'message' => 'Minimum order amount for this coupon is $' . number_format($coupon['min_order_value'], 2) . '.'
            ];
        }

        // Calculate discount
        $discount = $this->calculateDiscount($coupon, $subtotal);

        return [
            'success' => true,
            'message' => 'Coupon code applied successfully!',
            'coupon' => [
                'code' => $coupon['code'],
                'discount_type' => $coupon['discount_type'],
                'discount_value' => (float)$coupon['discount_value'],
                'discount_amount' => $discount
            ]
        ];
    }

    /**
     * Calculate discount value
     */
    private function calculateDiscount(array $coupon, float $subtotal): float {
        if ($coupon['discount_type'] === 'percentage') {
            return round(($subtotal * ((float)$coupon['discount_value'] / 100)), 2);
        } else {
            // fixed discount
            return min((float)$coupon['discount_value'], $subtotal);
        }
    }

    /**
     * Get all coupons (admin)
     */
    public function getAll(): array {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} ORDER BY id DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Create a new coupon (admin)
     */
    public function create(array $data): array {
        $code = strtoupper(trim($data['code'] ?? ''));
        if (empty($code)) {
            return ['success' => false, 'message' => 'Coupon code is required.'];
        }

        // Check duplicates
        $stmt = $this->db->prepare("SELECT id FROM {$this->table} WHERE code = ?");
        $stmt->execute([$code]);
        if ($stmt->fetch()) {
            return ['success' => false, 'message' => 'A coupon with this code already exists.'];
        }

        $stmt = $this->db->prepare(
            "INSERT INTO {$this->table} (code, discount_type, discount_value, min_order_value, expiry_date, active)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $code,
            $data['discount_type'] ?? 'fixed',
            (float)($data['discount_value'] ?? 0),
            (float)($data['min_order_value'] ?? 0),
            $data['expiry_date'] ?? date('Y-m-d', strtotime('+30 days')),
            isset($data['active']) ? (int)$data['active'] : 1
        ]);

        return ['success' => true, 'message' => 'Coupon created successfully!'];
    }

    /**
     * Delete a coupon (admin)
     */
    public function delete(int $id): array {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        return ['success' => true, 'message' => 'Coupon deleted successfully!'];
    }
}
