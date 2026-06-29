<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Cart.php';

setCorsHeaders();

$db   = (new Database())->getConnection();
$cart = new Cart($db);
$body = getRequestBody();

// All cart routes require authentication
$payload = requireAuth();
$userId  = $payload['id'];
$id      = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {
    // ── GET — Get user's cart ────────────────────────────────────────────────
    case 'GET':
        sendResponse(['success' => true, ...$cart->getUserCart($userId)]);
        break;

    // ── POST — Add item to cart ──────────────────────────────────────────────
    case 'POST':
        if (empty($body['food_id'])) sendResponse(['success' => false, 'message' => 'Food ID is required.'], 422);
        $quantity = max(1, (int) ($body['quantity'] ?? 1));
        $result   = $cart->addItem($userId, (int) $body['food_id'], $quantity);
        sendResponse($result, $result['success'] ? 200 : 400);
        break;

    // ── PUT — Update quantity ────────────────────────────────────────────────
    case 'PUT':
        if (!$id) sendResponse(['success' => false, 'message' => 'Cart item ID required.'], 422);
        if (!isset($body['quantity'])) sendResponse(['success' => false, 'message' => 'Quantity is required.'], 422);
        $result = $cart->updateQuantity($userId, $id, (int) $body['quantity']);
        sendResponse($result);
        break;

    // ── DELETE — Remove item or clear cart ──────────────────────────────────
    case 'DELETE':
        if (isset($_GET['clear']) && $_GET['clear'] === '1') {
            $cart->clearCart($userId);
            sendResponse(['success' => true, 'message' => 'Cart cleared.']);
        }
        if (!$id) sendResponse(['success' => false, 'message' => 'Cart item ID required.'], 422);
        sendResponse($cart->removeItem($userId, $id));
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
