<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Food.php';

setCorsHeaders();

$db   = (new Database())->getConnection();
$food = new Food($db);
$body = getRequestBody();
$id   = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {
    // GET — List all or single food
    case 'GET':
        if ($id) {
            $item = $food->findById($id);
            $item
                ? sendResponse(['success' => true, 'food' => $item])
                : sendResponse(['success' => false, 'message' => 'Food not found.'], 404);
        }
        $params = [
            'search'      => $_GET['search']      ?? '',
            'category_id' => $_GET['category_id'] ?? '',
            'sort'        => $_GET['sort']         ?? 'newest',
            'featured'    => $_GET['featured']     ?? '',
        ];
        $foods = $food->getAll($params);
        sendResponse(['success' => true, 'foods' => $foods, 'count' => count($foods)]);
        break;

    // POST — Create food (admin)
    case 'POST':
        requireAdmin();
        if (empty($body['name']))        sendResponse(['success' => false, 'message' => 'Food name is required.'], 422);
        if (empty($body['category_id'])) sendResponse(['success' => false, 'message' => 'Category is required.'], 422);
        if (empty($body['price']) || $body['price'] <= 0)
            sendResponse(['success' => false, 'message' => 'Valid price is required.'], 422);

        sendResponse($food->create($body), 201);
        break;

    // PUT — Update food (admin)
    case 'PUT':
        requireAdmin();
        if (!$id) sendResponse(['success' => false, 'message' => 'Food ID is required.'], 422);
        sendResponse($food->update($id, $body));
        break;

    // DELETE — Delete food (admin)
    case 'DELETE':
        requireAdmin();
        if (!$id) sendResponse(['success' => false, 'message' => 'Food ID is required.'], 422);
        sendResponse($food->delete($id));
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
