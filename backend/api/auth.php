<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

setCorsHeaders();

$db   = (new Database())->getConnection();
$user = new User($db);
$body = getRequestBody();

switch ($_SERVER['REQUEST_METHOD']) {
    // ── POST /api/auth.php?action=register ──────────────────────────────────
    case 'POST':
        $action = $_GET['action'] ?? 'login';

        if ($action === 'register') {
            // Validate
            if (empty($body['name']))  sendResponse(['success' => false, 'message' => 'Name is required.'], 422);
            if (empty($body['email']) || !filter_var($body['email'], FILTER_VALIDATE_EMAIL))
                sendResponse(['success' => false, 'message' => 'Valid email is required.'], 422);
            if (empty($body['password']) || strlen($body['password']) < 8)
                sendResponse(['success' => false, 'message' => 'Password must be at least 8 characters.'], 422);

            $result = $user->register(
                trim($body['name']),
                strtolower(trim($body['email'])),
                $body['password'],
                $body['phone']   ?? '',
                $body['address'] ?? ''
            );
            sendResponse($result, $result['success'] ? 201 : 422);
        }

        // Login
        if (empty($body['email']) || empty($body['password']))
            sendResponse(['success' => false, 'message' => 'Email and password are required.'], 422);

        $result = $user->login(strtolower(trim($body['email'])), $body['password']);
        sendResponse($result, $result['success'] ? 200 : 401);
        break;

    // ── GET /api/auth.php (get current user profile) ────────────────────────
    case 'GET':
        $payload = requireAuth();
        $profile = $user->findById($payload['id']);
        if (!$profile) sendResponse(['success' => false, 'message' => 'User not found.'], 404);
        sendResponse(['success' => true, 'user' => $profile]);
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
