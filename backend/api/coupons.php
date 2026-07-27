<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Coupon.php';

setCorsHeaders();

$db = (new Database())->getConnection();
$couponModel = new Coupon($db);
$body = getRequestBody();

// Auth required
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}

if (empty($body['code'])) {
    sendResponse(['success' => false, 'message' => 'Coupon code is required.'], 422);
}

if (!isset($body['subtotal']) || (float)$body['subtotal'] <= 0) {
    sendResponse(['success' => false, 'message' => 'Subtotal must be positive to apply a coupon.'], 422);
}

$result = $couponModel->validate($body['code'], (float)$body['subtotal']);
sendResponse($result, $result['success'] ? 200 : 400);
