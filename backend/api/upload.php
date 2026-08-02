<?php
require_once __DIR__ . '/../config/database.php';

setCorsHeaders();
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['success' => false, 'message' => 'POST method required.'], 405);
}

$uploadDir = __DIR__ . '/../uploads/';

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    sendResponse(['success' => false, 'message' => 'No file uploaded or upload error.'], 422);
}

$file     = $_FILES['image'];
$ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed  = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

if (!in_array($ext, $allowed, true)) {
    sendResponse(['success' => false, 'message' => 'Invalid file type. Only JPG, PNG, WEBP allowed.'], 422);
}

// Verify actual image contents and MIME type to prevent extension-spoofing
$info = @getimagesize($file['tmp_name']);
if ($info === false) {
    sendResponse(['success' => false, 'message' => 'File is not a valid image.'], 422);
}
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($info['mime'], $allowedMimeTypes, true)) {
    sendResponse(['success' => false, 'message' => 'Invalid image format type.'], 422);
}

// 5MB limit
if ($file['size'] > 5 * 1024 * 1024) {
    sendResponse(['success' => false, 'message' => 'File size must not exceed 5MB.'], 422);
}

$filename = uniqid('food_', true) . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    sendResponse(['success' => false, 'message' => 'Failed to save file.'], 500);
}

sendResponse([
    'success'  => true,
    'message'  => 'Image uploaded successfully.',
    'filename' => $filename,
    'url'      => 'http://localhost/uploads/' . $filename,
]);
