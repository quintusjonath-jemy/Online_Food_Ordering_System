<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Category.php';

setCorsHeaders();

$db       = (new Database())->getConnection();
$category = new Category($db);
$body     = getRequestBody();
$id       = isset($_GET['id']) ? (int) $_GET['id'] : null;

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($id) {
            $cat = $category->findById($id);
            $cat
                ? sendResponse(['success' => true, 'category' => $cat])
                : sendResponse(['success' => false, 'message' => 'Category not found.'], 404);
        }
        sendResponse(['success' => true, 'categories' => $category->getAll()]);
        break;

    case 'POST':
        requireAdmin();
        if (empty($body['name'])) sendResponse(['success' => false, 'message' => 'Category name is required.'], 422);
        sendResponse($category->create(trim($body['name']), $body['icon'] ?? '🍽️'), 201);
        break;

    case 'PUT':
        requireAdmin();
        if (!$id) sendResponse(['success' => false, 'message' => 'Category ID required.'], 422);
        if (empty($body['name'])) sendResponse(['success' => false, 'message' => 'Category name is required.'], 422);
        sendResponse($category->update($id, trim($body['name']), $body['icon'] ?? '🍽️'));
        break;

    case 'DELETE':
        requireAdmin();
        if (!$id) sendResponse(['success' => false, 'message' => 'Category ID required.'], 422);
        sendResponse($category->delete($id));
        break;

    default:
        sendResponse(['success' => false, 'message' => 'Method not allowed.'], 405);
}
