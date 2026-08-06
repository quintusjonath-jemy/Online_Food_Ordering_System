<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

setCorsHeaders();

$db   = (new Database())->getConnection();
$user = new User($db);
$body = getRequestBody();
$id   = isset($_GET['id']) ? (int) $_GET['id'] : null;

$payload = requireAuth();
$userId  = $payload['id'];

switch ($_SERVER['REQUEST_METHOD']) {
    // GET — Admin: list all users | Customer: own profile 
    case 'GET':
        if ($payload['role'] === 'admin') {
            sendResponse(['success' => true, 'users' => $user->getAll()]);
        } else {
            $profile = $user->findById($userId);
            sendResponse(['success' => true, 'user' => $profile]);
        }
        break;

    // PUT — Update own profile (or admin updates any)
    case 'PUT':
        $targetId = ($payload['role'] === 'admin' && $id) ? $id : $userId;
        sendResponse($user->update($targetId, $body));
        break;

    // DELETE — Admin only
    case 'DELETE':
        requireAdmin();
        if (!$id) sendResponse(['success' => false, 'message' => 'User ID required.'], 422);
        sendResponse($user->delete($id));
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
