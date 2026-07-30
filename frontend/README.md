# <p align="center">🍽️ SaveurEats — Premium Online Food Ordering & Reservation System</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-React%20v18-8B0000?style=for-the-badge&logo=vite&logoColor=white" alt="Vite-React" />
  <img src="https://img.shields.io/badge/PHP-8.2%20OOP-D4AF37?style=for-the-badge&logo=php&logoColor=white" alt="PHP OOP" />
  <img src="https://img.shields.io/badge/MySQL-Database-222222?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-Authentication-6B7280?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/CSS3-Glassmorphism-1A1A1A?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
</p>

<p align="center">
  <strong>SaveurEats</strong> is an enterprise-grade, full-stack online food ordering, dish customization, and table reservation management system. It combines a high-performance React Single Page Application (SPA) styled with custom luxury aesthetic tokens and a modular, object-oriented PHP REST API powered by MySQL PDO.
</p>

---

## 📋 Table of Contents

- [✨ Design Philosophy & Palette](#-design-philosophy--palette)
- [🚀 Key Features & System Capabilities](#-key-features--system-capabilities)
  - [👤 Customer Portal](#-customer-portal)
  - [👑 Administrative Management Panel](#-administrative-management-panel)
- [📐 System Architecture](#-system-architecture)
- [🗄️ Database Schema & Enterprise Models](#%EF%B8%8F-database-schema--enterprise-models)
- [📂 Project Directory Structure](#-project-directory-structure)
- [⚡ Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🔑 Demo Credentials](#-demo-credentials)
- [🔌 REST API Reference](#-rest-api-reference)
- [🔒 Security & Architectural Controls](#-security--architectural-controls)
- [🗺️ Future Development Roadmap](#%EF%B8%8F-future-development-roadmap)

---

## ✨ Design Philosophy & Palette

SaveurEats is built with a **Luxury Dining & Gourmet Bistro** theme. The visual system features glassmorphic overlays, custom micro-interactions, smooth hover elevations, and responsive components:

- 🍷 **Primary Color:** Deep Burgundy (`#8B0000`)
- ⚜️ **Secondary / Accent:** Luxury Gold (`#D4AF37`)
- 🍦 **Background Base:** Soft Warm Cream (`#FAF7F2`)
- ⬛ **Text & Contrast:** Obsidian Dark (`#1A1A1A`)
- 🔤 **Typography:** Poppins (Google Fonts)

---

## 🚀 Key Features & System Capabilities

### 👤 Customer Portal
* **Stateless JWT Authentication:** Secure registration and login with 24-hour token persistence, protected routes, and automatic session recovery.
* **Dynamic Menu & Filtering:** Live text search, category quick tabs with custom emoji iconography, and multi-attribute sorting (price, user ratings).
* **Dish Details & Addon Customization:** Dedicated food detail page (`/food/:id`) allowing customers to inspect ingredients, choose optional/required add-ons (e.g. Extra Cheese, Steak Doneness, Drinks), and specify special preparation instructions.
* **Persistent Shopping Cart:** Complete CRUD operations with dynamic subtotal calculations, tax estimation, and coupon code application saved directly in MySQL.
* **Promotional Discount Coupons:** Coupon validation system supporting both fixed-amount (e.g. `$10 OFF`) and percentage-based discounts (`20% OFF`) with minimum order constraints.
* **Streamlined Checkout:** Fast ordering with address auto-fill from user profiles, payment selection (Cash on Delivery / Card), and real-time total breakdown.
* **Interactive Order Tracking:** Step-by-step progress monitor (`Pending` → `Preparing` → `Out for Delivery` → `Delivered` / `Cancelled`) with order item inspection.
* **Table Reservation System:** Online table booking suite (`/book-table`) allowing guests to select party size, reservation date, time slot, and special dining requests.
* **Account Management:** User profile panel to update contact info, shipping address, and password.

### 👑 Administrative Management Panel
* **Executive Analytics Dashboard:** Real-time financial metrics including total revenue, order volume, total active customers, and menu item count alongside popular dishes and recent activity feeds.
* **Food Menu CRUD & Media Uploads:** Add, edit, toggle availability, and delete food items with an integrated PHP image file upload handler.
* **Category Management:** Manage menu categories with an interactive emoji picker and description builder.
* **Order Management & Pipeline:** Global order management queue with quick status updates (`Pending`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`) and customer detail views.
* **Table Reservations Management:** Comprehensive reservation management view (`/admin/reservations`) enabling restaurant managers to inspect, confirm, seat, or cancel guest bookings.
* **Customer Audit & User Management:** Complete user registry (`/admin/users`) to review customer accounts, update user roles, and manage permissions.

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Client [React SPA Frontend - Vite Port 5173]
        UI[React Components & Pages]
        CTX[AuthContext / CartContext / ToastContext]
        AX[Axios Service Layer API Client]
        UI --> CTX
        CTX --> AX
    end

    subgraph Server [PHP REST API - Apache / Nginx / Built-in Server]
        END[API Controllers: auth.php, foods.php, orders.php, etc.]
        MID[CORS & JWT Authentication Middleware]
        MOD[OOP Models: User, Food, Category, Order, Cart, Reservation, Coupon]
        AX -- HTTP JSON Requests + Authorization Bearer Token --&gt; MID
        MID --> END
        END --> MOD
    end

    subgraph Storage [Persistence & Files]
        DB[(MySQL Database food_ordering_db)]
        FS[Uploads Directory /backend/uploads]
        MOD -- PDO Prepared SQL Statements --&gt; DB
        END -- File Storage --&gt; FS
    end
```

---

## 🗄️ Database Schema & Enterprise Models

The system database (`food_ordering_db`) contains 11 relational tables:

```
food_ordering_db
├── users             (id, name, email, password, phone, address, role, loyalty_points, timestamps)
├── categories        (id, name, icon, created_at)
├── foods             (id, category_id, name, description, price, image, stock, rating, is_featured, timestamps)
├── cart              (id, user_id, food_id, quantity, selected_addons, timestamps)
├── orders            (id, user_id, total_price, status, delivery_address, phone, notes, payment_method, payment_status, coupon_code, discount_applied, timestamps)
├── order_items       (id, order_id, food_id, quantity, price, selected_addons)
├── tables            (id, table_number, capacity, status)
├── reservations      (id, user_id, guest_name, guest_email, guest_phone, reservation_date, reservation_time, party_size, table_id, status, special_requests, created_at)
├── addon_groups      (id, name, is_required, min_selection, max_selection)
├── addon_items       (id, addon_group_id, name, price)
├── food_addons       (food_id, addon_group_id)
└── coupons           (id, code, discount_type, discount_value, min_order_value, expiry_date, active)
```

---

## 📂 Project Directory Structure

```
Online_Food_Ordering/
├── README.md                           ← Project Documentation
├── restaurant_website_roadmap.md       ← Enterprise Scaling Architecture Plan
│
├── frontend/                           ← Vite + React SPA Client
│   ├── index.html                      ← HTML Entrypoint, SEO Meta & Google Fonts
│   ├── package.json                    ← NPM Dependencies & Scripts
│   ├── vite.config.js                  ← Vite Build & Dev Server Config
│   └── src/
│       ├── main.jsx                    ← Application Mount Point
│       ├── App.jsx                     ← Router Declarations & Guarded Layouts
│       ├── index.css                   ← Design Tokens, Global CSS & Utility Classes
│       ├── assets/                     ← Static Graphic Assets & Hero Banners
│       ├── components/                 ← Modular UI Components
│       │   ├── Navbar.jsx              ← Main Header with Dynamic Cart Badge & Auth State
│       │   ├── Sidebar.jsx             ← Navigation Sidebar for Admin Dashboard
│       │   ├── FoodCard.jsx            ← Food Card with Rating, Price & Quick Add
│       │   ├── CartItem.jsx            ← Shopping Cart Row Item Component
│       │   ├── OrderCard.jsx           ← Order History Summary & Status Progress Bar
│       │   ├── LoadingSpinner.jsx      ← Loading Indicator Component
│       │   └── Footer.jsx              ← Global Footer Component
│       ├── context/                    ← React Context Providers
│       │   ├── AuthContext.jsx         ← Authentication & User Session State
│       │   ├── CartContext.jsx         ← Real-time Shopping Cart Management
│       │   └── ToastContext.jsx        ← Toast Feedback System
│       ├── services/
│       │   └── api.js                  ← Axios Instance with JWT Interceptor Setup
│       └── pages/                      ← Application Views
│           ├── Home.jsx                ← Hero Section, Featured Foods & Customer Reviews
│           ├── Menu.jsx                ← Food Catalog with Category Tabs, Search & Sort
│           ├── FoodDetails.jsx         ← Dish Inspection, Addons & Special Instructions
│           ├── Cart.jsx                ← Cart Summary, Coupon Application & Tax Calculation
│           ├── Checkout.jsx            ← Order Confirmation, Address & Payment Selection
│           ├── Orders.jsx              ← Order History & Real-Time Tracker Modal
│           ├── Profile.jsx             ← Account Details & Password Management
│           ├── BookTable.jsx           ← Table Reservation Booking Interface
│           ├── Login.jsx               ← User Authentication Page
│           ├── Register.jsx            ← User Registration Page
│           └── admin/                  ← Administrative Portal
│               ├── AdminDashboard.jsx  ← Metrics Cards, Charts & Business Analytics
│               ├── ManageFoods.jsx     ← Food Item CRUD & Image Uploader
│               ├── ManageCategories.jsx← Category CRUD & Emoji Selector
│               ├── ManageOrders.jsx    ← Global Order Queue & Status Modifier
│               ├── ManageUsers.jsx     ← Customer Account Registry & Role Editor
│               └── ManageReservations.jsx ← Table Booking Management Console
│
└── backend/                            ← Object-Oriented PHP REST API
    ├── index.php                       ← API Welcome & Server Health Check Dashboard
    ├── .htaccess                       ← Apache CORS & URL Rewrite Configuration
    ├── config/
    │   ├── database.php                ← PDO Database Singleton & JWT Helper Methods
    │   └── database.sql                ← Full Relational Database Schema & Seed Data
    ├── uploads/                        ← Uploaded Menu Dish Images Directory
    ├── models/                         ← Domain Data Models (OOP PDO Data Access)
    │   ├── User.php                    ← User CRUD & Password Hashing Methods
    │   ├── Food.php                    ← Food Catalog & Addon Relationship Queries
    │   ├── Category.php                ├── Category Management Operations
    │   ├── Cart.php                    ├── User Shopping Cart Operations
    │   ├── Order.php                   ├── Order Creation & Status Workflows
    │   ├── Reservation.php            ├── Table Reservation Logic & Availability
    │   └── Coupon.php                  └── Promotional Discount Validation Logic
    └── api/                            ← Endpoint Controllers (REST API Routers)
        ├── auth.php                    ← Authentication Endpoint (/api/auth.php)
        ├── foods.php                   ← Food Catalog Endpoint (/api/foods.php)
        ├── categories.php              ← Category Management Endpoint (/api/categories.php)
        ├── cart.php                    ← Cart Management Endpoint (/api/cart.php)
        ├── orders.php                  ← Orders Endpoint (/api/orders.php)
        ├── reservations.php            ← Table Booking Endpoint (/api/reservations.php)
        ├── coupons.php                 ← Coupon Validation Endpoint (/api/coupons.php)
        ├── users.php                   ← User Audit Endpoint (/api/users.php)
        ├── stats.php                   ← Admin Metrics Endpoint (/api/stats.php)
        └── upload.php                  ← Image File Upload Handler (/api/upload.php)
```

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- **PHP** >= 8.1 with `pdo_mysql`, `json`, and `mbstring` extensions enabled.
- **MySQL** / MariaDB Database Server.
- **Node.js** >= 18.x & **npm**.
- **Apache** / **Nginx** or PHP's built-in CLI web server.

---

### Step 1: Database Initialization
1. Start your MySQL server (e.g. via XAMPP, WAMP, or system service).
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) or your MySQL CLI client.
3. Import the `/backend/config/database.sql` script into your MySQL database server:
   ```bash
   mysql -u root -p < backend/config/database.sql
   ```
   *This automatically creates the `food_ordering_db` database, table structures, enterprise extensions, and seeds demo accounts.*

---

### Step 2: Backend API Configuration

#### Option A: Running via PHP Built-in Web Server (Recommended for Fast Local Development)
```bash
cd backend
php -S localhost:8000
```
Your PHP REST API is now listening at **`http://localhost:8000`**.

#### Option B: Running via Apache / XAMPP
1. Move or link the project directory to your Apache `htdocs` directory.
2. Ensure `http://localhost/backend` resolves to the `backend/` root directory.
3. Update `frontend/src/services/api.js` `baseURL` if your local backend URI differs.

Visiting `http://localhost:8000/index.php` (or `http://localhost/backend/index.php`) in your browser will display the interactive **API Status Dashboard** displaying server status and database connectivity.

---

### Step 3: Frontend Client Setup & Launch
1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev -- --port 5173
   ```
4. Open **`http://localhost:5173/`** in your browser to launch the web app.

---

## 🔑 Demo Credentials

The database script pre-loads the system with ready-to-use demo accounts:

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **👑 Admin** | `admin@foodie.com` | `password` | Full administrative control, sales analytics, menu management, customer audit, reservation management |
| **👤 Customer** | `john@example.com` | `password` | Full ordering, cart operations, table booking, profile updates, order tracking |
| **👤 Customer** | `sarah@example.com` | `password` | Full ordering, cart operations, table booking, profile updates, order tracking |

---

## 🔌 REST API Reference

| Endpoint | HTTP Method | Auth Required | Description |
|---|---|---|---|
| `/api/auth.php?action=login` | `POST` | Public | Authenticates user & returns JWT token |
| `/api/auth.php?action=register` | `POST` | Public | Registers new customer account |
| `/api/auth.php?action=me` | `GET` | User | Fetches current user profile from JWT payload |
| `/api/auth.php?action=update-profile` | `PUT` | User | Updates user name, phone, and delivery address |
| `/api/foods.php` | `GET` | Public | Lists all foods with search, category filtering & sorting |
| `/api/foods.php?id={id}` | `GET` | Public | Fetches detailed food item including addon groups |
| `/api/foods.php` | `POST` | Admin | Creates a new food item |
| `/api/foods.php?id={id}` | `PUT` | Admin | Updates food details, stock & pricing |
| `/api/foods.php?id={id}` | `DELETE` | Admin | Removes food item from menu |
| `/api/categories.php` | `GET` | Public | Lists all categories and emoji icons |
| `/api/categories.php` | `POST` | Admin | Adds a new category |
| `/api/cart.php` | `GET` | User | Retrieves customer active shopping cart items |
| `/api/cart.php` | `POST` | User | Adds food item with selected add-ons to cart |
| `/api/cart.php?id={id}` | `PUT` | User | Updates quantity of a cart item |
| `/api/cart.php?id={id}` | `DELETE` | User | Removes item from cart |
| `/api/orders.php` | `GET` | User / Admin | Retrieves user order history or all orders for admin |
| `/api/orders.php` | `POST` | User | Places a new order from current cart |
| `/api/orders.php?id={id}` | `PUT` | Admin | Updates order status (`pending` ➔ `delivered`) |
| `/api/reservations.php` | `GET` | User / Admin | Retrieves reservations for user or all for admin |
| `/api/reservations.php` | `POST` | User / Public | Creates a new table booking reservation |
| `/api/reservations.php?id={id}`| `PUT` | Admin | Updates reservation status (`pending` ➔ `seated`) |
| `/api/coupons.php?action=validate` | `POST` | User | Validates coupon code and returns discount |
| `/api/users.php` | `GET` | Admin | Lists all registered accounts |
| `/api/stats.php` | `GET` | Admin | Computes dashboard analytics & financial reports |
| `/api/upload.php` | `POST` | Admin | Uploads image file for food items |

---

## 🔒 Security & Architectural Controls

* **Stateless JWT Tokens:** Authentication utilizes `HMAC-SHA256` signed JWT tokens returned upon successful login, stored securely on the client, and passed via HTTP `Authorization: Bearer` headers.
* **Bcrypt Password Security:** Passwords are never stored in plain text. The backend enforces PHP's native `password_hash()` utilizing `PASSWORD_BCRYPT` with dynamic salting.
* **SQL Injection Prevention:** Database interactions use PDO Prepared Statements with bound parameters (`:param` and `?`), preventing SQL injection vectors across all CRUD APIs.
* **Cross-Origin Resource Sharing (CORS):** Backend header policies explicitly allow client origin domains while enforcing strict CORS OPTIONS preflight checks.
* **Role-Based Access Control (RBAC):** Middleware checks (`requireAuth()` and `requireAdmin()`) validate JWT tokens and user roles before executing administrative code paths.

---

## 🗺️ Future Development Roadmap

The application architecture includes a detailed expansion blueprint in [`restaurant_website_roadmap.md`](file:///home/jonath/Documents/code/react/Online_Food_Ordering/restaurant_website_roadmap.md):

1. **Integrated Online Payment Gateways:** Direct integration with Stripe Elements & PayPal SDKs for credit/debit card processing.
2. **Real-time Push Notifications:** WebSockets / Swoole integration for instant notification alerts when an order status changes.
3. **Delivery Radius & Geocoding:** Google Maps Distance Matrix API integration to verify customer address proximity before order checkout.
4. **Loyalty Rewards Program:** Customer point accumulation logic (1 point per $10 spent) redeemable for menu discounts.

---

<p align="center">
  Crafted with ❤️ for SaveurEats — Modern Dining Experience
</p>
