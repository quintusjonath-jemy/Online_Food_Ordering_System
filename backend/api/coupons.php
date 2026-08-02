<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Coupon.php';

setCorsHeaders();

$db = (new Database())->getConnection();
$couponModel = new Coupon($db);
$body = getRequestBody();

$payload = requireAuth();

switch ($_SERVER['REQUEST_METHOD']) {
    // GET: Admin views all coupons
    case 'GET':
        requireAdmin();
        sendResponse(['success' => true, 'coupons' => $couponModel->getAll()]);
        break;

    // POST: Admin creates a coupon OR user validates a coupon
    case 'POST':
        $action = $_GET['action'] ?? 'validate';
        if ($action === 'create') {
            requireAdmin();
            if (empty($body['code'])) sendResponse(['success' => false, 'message' => 'Coupon code is required.'], 422);
            if (empty($body['discount_type'])) sendResponse(['success' => false, 'message' => 'Discount type is required.'], 422);
            if (empty($body['discount_value']) || (float)$body['discount_value'] <= 0) {
                sendResponse(['success' => false, 'message' => 'Valid discount value is required.'], 422);
            }
            $result = $couponModel->create($body);
            sendResponse($result, $result['success'] ? 201 : 400);
        } else {
            // Validate coupon code
            if (empty($body['code'])) {
                sendResponse(['success' => false, 'message' => 'Coupon code is required.'], 422);
            }
            if (!isset($body['subtotal']) || (float)$body['subtotal'] <= 0) {
                sendResponse(['success' => false, 'message' => 'Subtotal must be positive to apply a coupon.'], 422);
            }
            $result = $couponModel->validate($body['code'], (float)$body['subtotal']);
            sendResponse($result, $result['success'] ? 200 : 400);
        }
        break;

    // DELETE: Admin removes a coupon
    case 'DELETE':
        requireAdmin();
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if (!$id) {
            sendResponse(['success' => false, 'message' => 'Coupon ID is required.'], 422);
        }
        $result = $couponModel->delete($id);
        sendResponse($result, $result['success'] ? 200 : 400);
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
