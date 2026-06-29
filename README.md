# <p align="center">🍽️ SaveurEats — Premium Online Food Ordering System</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vite-React%20v18-8B0000?style=for-the-badge&logo=vite&logoColor=white" alt="Vite-React" />
  <img src="https://img.shields.io/badge/PHP-8.2%20OOP-D4AF37?style=for-the-badge&logo=php&logoColor=white" alt="PHP OOP" />
  <img src="https://img.shields.io/badge/MySQL-Database-222222?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-Authentication-6B7280?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
</p>

<p align="center">
  A premium, full-stack dining and delivery application combining a sleek, modern React single-page application (SPA) with a robust, object-oriented PHP REST API backend.
</p>

---

## ✨ Design Philosophy & Palette

SaveurEats is designed around a **Premium Restaurant** theme, utilizing soft micro-animations, structured elevations, and an elegant luxury palette:

- 🍷 **Primary Color:** Deep Burgundy (`#8B0000`)
- ⚜️ **Secondary/Accent:** Luxury Gold (`#D4AF37`)
- 🍦 **Background:** Warm Cream (`#FAF7F2`)
- 🔤 **Typography:** Poppins (Google Fonts)

---

## 🚀 Key Features

### 👤 Customer Experience
* **Secure Auth:** JWT Authentication with 24-hour persistent session token storage.
* **Interactive Menu:** Live search, category filtering (using visual emojis), and multi-criteria sorting (price, rating, date).
* **Live Shopping Cart:** Full CRUD with real-time subtotal and tax calculation, saved dynamically on the MySQL database.
* **Streamlined Checkout:** Form validation for shipping info & CoD payment processing.
* **Order History & Tracker:** Interactive progress tracking dashboard (`Pending` → `Preparing` → `Out for Delivery` → `Delivered`).
* **Profile Management:** Edit profile information and update account passwords.

### 👑 Administrative Panel
* **Analytics Dashboard:** Statistics cards tracking total revenue, items, customers, and active orders.
* **Popular Items & Recent Activity:** Real-time data lists showcasing trending dishes and recent order queues.
* **Full CRUD Management:**
  - **Foods:** Create, read, update, and delete menu items with integrated **file uploads**.
  - **Categories:** Dynamic category management with an interactive emoji-icon picker.
  - **Orders:** Global queue management with status modifier actions.
  - **Customers:** Database audit tools allowing administrators to inspect active customer accounts.

---

## 📐 Architecture & Workflow

```mermaid
graph TD
    subgraph Client [React Frontend SPA - Port 5173]
        A[App.jsx] --> B[AuthContext / CartContext]
        B --> C[Pages: Home, Menu, Admin Dashboard]
        C --> D[Axios Service Layer]
    end

    subgraph Server [PHP REST API - Apache Port 80]
        D -- HTTP Requests + JWT --&gt; E[API Endpoints: foods.php, auth.php]
        E --> F[OOP Model Layer: Food.php, User.php]
        F --> G[Database.php PDO Connection]
    end

    subgraph Data [Storage]
        G -- SQL Queries --&gt; H[(MySQL Database)]
    end
```

---

## 📂 Project Directory Structure

```
Online_Food_Ordering/
├── README.md
├── frontend/                        ← Vite + React.js Client
│   ├── index.html                   ← Page Entry, SEO Meta, Google Fonts
│   └── src/
│       ├── App.jsx                  ← Route definitions & guards
│       ├── index.css                ← Premium global styles & variables
│       ├── components/              ← Reusable UI (Navbar, FoodCard, CartItem, Sidebar, Footer)
│       ├── context/                 ← AuthContext (JWT), CartContext, ToastContext
│       ├── services/
│       │   └── api.js               ← Axios configuration & request interceptors
│       └── pages/                   ← Main views
│           ├── Home.jsx             ← Interactive Hero, Reviews, Featured
│           ├── Menu.jsx             ← Dynamic filters, search, grid
│           └── admin/               ← Admin dashboard & management panels
└── backend/                         ← PHP Backend REST API
    ├── index.php                    ← Health-check Status Page
    ├── .htaccess                    ← CORS headers & URL Rewriting
    ├── config/
    │   ├── database.php             ← PDO configuration & JWT encoding
    │   └── database.sql             ← Schema structure & seed datasets
    ├── models/                      ← OOP Domain Models (User, Food, Category, Order, Cart)
    └── api/                         ← Router endpoints handling raw REST verbs
```

---

## ⚡ Quick Start Guide

### 1. Database Setup
1. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Create a database named `food_ordering_db`.
3. Import the `/backend/config/database.sql` script.

### 2. Backend Config (XAMPP)
Since Apache serves your backend directly as the DocumentRoot:
Ensure the backend folder `/your/file/path/Online_Food_Ordering/backend` is set as the document root in your XAMPP configuration.

Visiting `http://localhost/` in your browser will display the beautiful **API Status Dashboard** verifying database connectivity.

### 3. Frontend Execution
Clone the repository and run the client:
```bash
cd frontend
npm install
npm run dev -- --port 5173
```
Open **`http://localhost:5173/`** to run the application.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **👑 Admin Account** | `admin@foodie.com` | `password` |
| **👤 Customer Account** | `john@example.com` | `password` |
| **👤 Customer Account** | `sarah@example.com` | `password` |

---

## 🔒 Security & Implementation Details

* **Stateless Auth:** Secure JSON Web Tokens (JWT) are signed server-side using a HMAC-SHA256 signature, stored client-side in `localStorage`, and attached to request headers via Axios interceptors.
* **Password Hashing:** Passwords are fully hashed database-side using standard `PASSWORD_BCRYPT` algorithms.
* **REST APIs:** Proper HTTP method verbs (GET, POST, PUT, DELETE) handle all resource manipulations.
* **CORS Guarding:** Configured Apache headers and backend constraints protect the backend resources while allowing hot-reloads during local development.
