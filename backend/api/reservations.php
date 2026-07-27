<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Reservation.php';

setCorsHeaders();

$db = (new Database())->getConnection();
$reservation = new Reservation($db);
$body = getRequestBody();

// Auth required
$payload = requireAuth();
$userId = $payload['id'];
$isAdmin = $payload['role'] === 'admin';
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id) {
            $detail = $reservation->findById($id);
            if (!$detail) {
                sendResponse(['success' => false, 'message' => 'Reservation not found.'], 404);
            }
            // Check ownership
            if (!$isAdmin && $detail['user_id'] !== $userId) {
                sendResponse(['success' => false, 'message' => 'Access denied.'], 403);
            }
            sendResponse(['success' => true, 'reservation' => $detail]);
        }

        if ($isAdmin) {
            $params = [
                'status' => $_GET['status'] ?? '',
                'date' => $_GET['date'] ?? ''
            ];
            sendResponse(['success' => true, 'reservations' => $reservation->getAll($params)]);
        } else {
            sendResponse(['success' => true, 'reservations' => $reservation->getByUser($userId)]);
        }
        break;

    case 'POST':
        // If guest reservation, user_id is optional but we link to current user
        $body['user_id'] = $userId;
        
        // Validation
        if (empty($body['guest_name'])) sendResponse(['success' => false, 'message' => 'Name is required.'], 422);
        if (empty($body['guest_email'])) sendResponse(['success' => false, 'message' => 'Email is required.'], 422);
        if (empty($body['guest_phone'])) sendResponse(['success' => false, 'message' => 'Phone number is required.'], 422);
        if (empty($body['date'])) sendResponse(['success' => false, 'message' => 'Date is required.'], 422);
        if (empty($body['time'])) sendResponse(['success' => false, 'message' => 'Time slot is required.'], 422);
        if (empty($body['party_size']) || (int)$body['party_size'] <= 0) {
            sendResponse(['success' => false, 'message' => 'Valid party size is required.'], 422);
        }

        $result = $reservation->create($body);
        sendResponse($result, $result['success'] ? 201 : 400);
        break;

    case 'PUT':
        requireAdmin();
        if (!$id) {
            sendResponse(['success' => false, 'message' => 'Reservation ID is required.'], 422);
        }
        if (empty($body['status'])) {
            sendResponse(['success' => false, 'message' => 'Status is required.'], 422);
        }

        $result = $reservation->updateStatus($id, $body['status']);
        sendResponse($result, $result['success'] ? 200 : 400);
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
