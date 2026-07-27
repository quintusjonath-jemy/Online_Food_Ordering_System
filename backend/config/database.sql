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

-- =============================================
-- ENTERPRISE SCHEMA EXPANSIONS
-- =============================================

-- Add columns to existing tables
ALTER TABLE users ADD COLUMN loyalty_points INT DEFAULT 0;
ALTER TABLE cart ADD COLUMN selected_addons JSON DEFAULT NULL;

ALTER TABLE orders 
ADD COLUMN payment_method ENUM('cod', 'stripe', 'paypal') DEFAULT 'cod',
ADD COLUMN payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
ADD COLUMN transaction_reference VARCHAR(255) DEFAULT NULL,
ADD COLUMN coupon_code VARCHAR(50) DEFAULT NULL,
ADD COLUMN discount_applied DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE order_items ADD COLUMN selected_addons JSON DEFAULT NULL;

-- 1. Tables Configuration Table
CREATE TABLE IF NOT EXISTS tables (
    id INT AUTO_INCREMENT PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- 2. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INT NOT NULL,
    table_id INT,
    status ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL
);

-- 3. Addon Groups Table
CREATE TABLE IF NOT EXISTS addon_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_required TINYINT(1) DEFAULT 0,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1
);

-- 4. Addon Items Table
CREATE TABLE IF NOT EXISTS addon_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    addon_group_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (addon_group_id) REFERENCES addon_groups(id) ON DELETE CASCADE
);

-- 5. Food Addons Mapping
CREATE TABLE IF NOT EXISTS food_addons (
    food_id INT NOT NULL,
    addon_group_id INT NOT NULL,
    PRIMARY KEY (food_id, addon_group_id),
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
    FOREIGN KEY (addon_group_id) REFERENCES addon_groups(id) ON DELETE CASCADE
);

-- 6. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_value DECIMAL(10,2) DEFAULT 0.00,
    expiry_date DATE NOT NULL,
    active TINYINT(1) DEFAULT 1
);

-- =============================================
-- SEED DATA FOR ENTERPRISE MODULES
-- =============================================

-- Seed tables
INSERT INTO tables (table_number, capacity) VALUES
('T-1', 2), ('T-2', 2), ('T-3', 4), ('T-4', 4), ('T-5', 6), ('T-6', 8);

-- Seed coupon codes
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, expiry_date, active) VALUES
('SUMMER20', 'percentage', 20.00, 20.00, '2027-12-31', 1),
('WELCOME10', 'fixed', 10.00, 30.00, '2027-12-31', 1);

-- Seed addon groups
INSERT INTO addon_groups (name, is_required, min_selection, max_selection) VALUES
('Extra Toppings', 0, 0, 5),
('Choose Drink', 0, 0, 1),
('Steak Doneness', 1, 1, 1);

-- Seed addon items
INSERT INTO addon_items (addon_group_id, name, price) VALUES
(1, 'Extra Cheese', 1.50),
(1, 'Crispy Bacon', 2.00),
(1, 'Sautéed Mushrooms', 1.25),
(1, 'Avocado Slice', 1.75),
(2, 'Coca Cola', 2.50),
(2, 'Iced Tea', 2.75),
(2, 'Mineral Water', 2.00),
(3, 'Rare', 0.00),
(3, 'Medium Rare', 0.00),
(3, 'Medium', 0.00),
(3, 'Well Done', 0.00);

-- Map addons to foods
-- Burgers get Extra Toppings (group 1) & Choose Drink (group 2)
INSERT INTO food_addons (food_id, addon_group_id) VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1), (3, 2),
-- Pizzas get Extra Toppings
(4, 1), (5, 1), (6, 1),
-- Wagyu Ribeye (id 20) gets Steak Doneness (group 3)
(20, 3);

