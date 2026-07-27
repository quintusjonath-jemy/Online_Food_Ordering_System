<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Food.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Order.php';

require_once __DIR__ . '/../models/Reservation.php';

setCorsHeaders();
requireAdmin();

$db          = (new Database())->getConnection();
$food        = new Food($db);
$user        = new User($db);
$order       = new Order($db);
$reservation = new Reservation($db);

$stats = [
    'total_foods'        => $food->count(),
    'total_customers'    => $user->countCustomers(),
    'orders_today'       => $order->countToday(),
    'reservations_today' => $reservation->countToday(),
    'total_revenue'      => $order->getTotalRevenue(),
    'recent_orders'      => $order->getRecent(8),
    'popular_foods'      => $food->getPopular(5),
    'monthly_revenue'    => $order->getMonthlyRevenue(),
];

sendResponse(['success' => true, 'stats' => $stats]);
