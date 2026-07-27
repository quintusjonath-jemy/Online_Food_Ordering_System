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
}
