-- Online Food Ordering System - Database Schema
-- Run this file in phpMyAdmin or MySQL CLI

CREATE DATABASE IF NOT EXISTS food_ordering_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_ordering_db;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT '🍽️',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FOODS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    stock INT DEFAULT 100,
    rating DECIMAL(3,2) DEFAULT 4.50,
    is_featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- =============================================
-- CART TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_cart_item (user_id, food_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status ENUM('pending','preparing','out_for_delivery','delivered','cancelled') DEFAULT 'pending',
    delivery_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    notes TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    food_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
);

-- =============================================
-- SEED DATA - Admin User
-- Password: admin123 (hashed)
-- =============================================
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Administrator', 'admin@foodie.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0100', '123 Admin Street, City', 'admin'),
('John Smith', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0101', '456 Oak Avenue, Springfield', 'customer'),
('Sarah Johnson', 'sarah@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '+1-555-0102', '789 Maple Drive, Shelbyville', 'customer');

-- Password for all seed users is: password

-- =============================================
-- SEED DATA - Categories
-- =============================================
INSERT INTO categories (name, icon) VALUES
('Burgers', '🍔'),
('Pizza', '🍕'),
('Sushi', '🍣'),
('Pasta', '🍝'),
('Salads', '🥗'),
('Desserts', '🍰'),
('Drinks', '🥤'),
('Grills', '🥩');

-- =============================================
-- SEED DATA - Foods
-- =============================================
INSERT INTO foods (category_id, name, description, price, image, stock, rating, is_featured) VALUES
-- Burgers (cat 1)
(1, 'Classic Smash Burger', 'Juicy double-smash patty with aged cheddar, caramelized onions, house pickles and our secret sauce on a brioche bun.', 14.99, 'burger1.jpg', 50, 4.8, 1),
(1, 'BBQ Bacon Burger', 'Smoky beef patty topped with crispy bacon, BBQ sauce, cheddar cheese and crispy onion rings.', 16.99, 'burger2.jpg', 45, 4.7, 0),
(1, 'Mushroom Swiss Burger', 'Angus beef patty smothered in sautéed mushrooms and Swiss cheese with garlic aioli.', 15.49, 'burger3.jpg', 40, 4.6, 0),

-- Pizza (cat 2)
(2, 'Margherita Royale', 'San Marzano tomato base, fresh buffalo mozzarella, hand-torn basil and a drizzle of extra virgin olive oil.', 18.99, 'pizza1.jpg', 60, 4.9, 1),
(2, 'Truffle Mushroom Pizza', 'Black truffle paste, wild mushrooms, taleggio cheese, fresh thyme and parmesan shavings.', 22.99, 'pizza2.jpg', 35, 4.8, 1),
(2, 'Pepperoni Inferno', 'Double pepperoni, spicy nduja, fresh chilli, mozzarella and honey drizzle on a crispy base.', 19.99, 'pizza3.jpg', 55, 4.7, 0),

-- Sushi (cat 3)
(3, 'Dragon Roll', 'Shrimp tempura, cucumber, avocado with thinly sliced avocado on top, eel sauce and sesame seeds.', 24.99, 'sushi1.jpg', 30, 4.9, 1),
(3, 'Salmon Sashimi Platter', 'Premium fresh Atlantic salmon sashimi, 12 pieces, served with pickled ginger, wasabi and soy sauce.', 28.99, 'sushi2.jpg', 25, 4.8, 0),
(3, 'Rainbow Roll', 'California roll topped with tuna, salmon, yellowtail, shrimp and avocado in a beautiful arrangement.', 26.99, 'sushi3.jpg', 28, 4.7, 0),

-- Pasta (cat 4)
(4, 'Truffle Carbonara', 'Slow-cooked free-range egg yolk, guanciale, pecorino romano, black pepper and white truffle oil.', 19.99, 'pasta1.jpg', 40, 4.8, 1),
(4, 'Lobster Linguine', 'Fresh linguine with half a Boston lobster, cherry tomatoes, white wine, garlic and fresh parsley.', 34.99, 'pasta2.jpg', 20, 4.9, 0),
(4, 'Pesto Genovese', 'Trofie pasta with classic Genovese basil pesto, green beans, baby potatoes and parmesan.', 16.99, 'pasta3.jpg', 45, 4.6, 0),

-- Salads (cat 5)
(5, 'Caesar Supreme', 'Romaine hearts, house-made caesar dressing, sourdough croutons, anchovies and aged parmesan.', 12.99, 'salad1.jpg', 60, 4.5, 0),
(5, 'Mediterranean Bowl', 'Quinoa, roasted vegetables, feta cheese, kalamata olives, sun-dried tomatoes and lemon herb dressing.', 14.99, 'salad2.jpg', 50, 4.6, 0),

-- Desserts (cat 6)
(6, 'Molten Lava Cake', 'Warm dark chocolate fondant with a gooey centre, served with vanilla bean gelato and berry coulis.', 9.99, 'dessert1.jpg', 40, 4.9, 1),
(6, 'Crème Brûlée', 'Classic French vanilla custard with a perfectly caramelized sugar crust, served with fresh berries.', 8.99, 'dessert2.jpg', 35, 4.7, 0),
(6, 'Tiramisu', 'Traditional Italian dessert with espresso-soaked ladyfingers, mascarpone and cocoa dusting.', 8.49, 'dessert3.jpg', 45, 4.8, 0),

-- Drinks (cat 7)
(7, 'Artisan Lemonade', 'Fresh-squeezed lemonade with muddled herbs, a choice of mint, basil or lavender, served over ice.', 5.99, 'drink1.jpg', 100, 4.5, 0),
(7, 'Mango Lassi', 'Creamy blended mango, full-fat yoghurt, rose water and a pinch of cardamom.', 6.49, 'drink2.jpg', 80, 4.7, 0),

-- Grills (cat 8)
(8, 'Wagyu Ribeye Steak', '200g Wagyu ribeye, cooked to your perfection, served with truffle fries and chimichurri sauce.', 54.99, 'grill1.jpg', 15, 4.9, 1),
(8, 'Tandoori Mixed Grill', 'Chicken tikka, seekh kebab, lamb chop and paneer tikka, served with naan and mint chutney.', 29.99, 'grill2.jpg', 25, 4.7, 0);

-- =============================================
-- SAMPLE ORDERS
-- =============================================
INSERT INTO orders (user_id, total_price, status, delivery_address, phone, notes) VALUES
(2, 47.97, 'delivered', '456 Oak Avenue, Springfield, IL 62701', '+1-555-0101', 'Please ring doorbell'),
(2, 28.99, 'preparing', '456 Oak Avenue, Springfield, IL 62701', '+1-555-0101', ''),
(3, 62.97, 'pending', '789 Maple Drive, Shelbyville', '+1-555-0102', 'Extra napkins please');

INSERT INTO order_items (order_id, food_id, quantity, price) VALUES
(1, 1, 2, 14.99),
(1, 4, 1, 18.99),
(2, 7, 1, 24.99),
(2, 18, 1, 4.00),
(3, 20, 1, 54.99),
(3, 10, 1, 19.99),
(3, 15, 1, 8.99);
