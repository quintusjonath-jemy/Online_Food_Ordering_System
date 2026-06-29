<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Cart.php';

setCorsHeaders();

$db    = (new Database())->getConnection();
$order = new Order($db);
$cart  = new Cart($db);
$body  = getRequestBody();
$id    = isset($_GET['id']) ? (int) $_GET['id'] : null;

$payload = requireAuth();
$userId  = $payload['id'];
$isAdmin = $payload['role'] === 'admin';

switch ($_SERVER['REQUEST_METHOD']) {
    // ── GET — Customer: own orders | Admin: all orders ───────────────────────
    case 'GET':
        if ($id) {
            // Get single order details (customer sees own, admin sees any)
            $detail = $order->findById($id, $isAdmin ? null : $userId);
            $detail
                ? sendResponse(['success' => true, 'order' => $detail])
                : sendResponse(['success' => false, 'message' => 'Order not found.'], 404);
            break;
        }
        if ($isAdmin) {
            $params = ['status' => $_GET['status'] ?? ''];
            sendResponse(['success' => true, 'orders' => $order->getAll($params)]);
        } else {
            sendResponse(['success' => true, 'orders' => $order->getByUser($userId)]);
        }
        break;

    // ── POST — Place a new order (checkout) ──────────────────────────────────
    case 'POST':
        // Validate delivery info
        if (empty($body['address'])) sendResponse(['success' => false, 'message' => 'Delivery address is required.'], 422);
        if (empty($body['phone']))   sendResponse(['success' => false, 'message' => 'Phone number is required.'], 422);

        // Fetch cart items
        $cartData = $cart->getUserCart($userId);
        if (empty($cartData['items'])) {
            sendResponse(['success' => false, 'message' => 'Your cart is empty.'], 422);
        }

        $result = $order->createFromCart(
            $userId,
            $cartData['items'],
            $cartData['total'],
            ['address' => $body['address'], 'phone' => $body['phone'], 'notes' => $body['notes'] ?? '']
        );

        // Clear cart on success
        if ($result['success']) {
            $cart->clearCart($userId);
        }

        sendResponse($result, $result['success'] ? 201 : 400);
        break;

    // ── PUT — Update order status (admin only) ───────────────────────────────
    case 'PUT':
        requireAdmin();
        if (!$id) sendResponse(['success' => false, 'message' => 'Order ID required.'], 422);
        if (empty($body['status'])) sendResponse(['success' => false, 'message' => 'Status is required.'], 422);
        sendResponse($order->updateStatus($id, $body['status']));
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
