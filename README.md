# Jutar Ghor (জুতার ঘর) — Premium Shoe E-Commerce Web Application

**Jutar Ghor (জুতার ঘর)** is a complete, modern, production-ready full-stack Shoe E-Commerce web application built specifically for the Bangladesh footwear market. It features a high-end customer-facing storefront and a fully functional, secure Admin Dashboard connected via a shared relational SQLite database.

---

## 🌟 Key Features

### 1. Modern Sneaker Boutique Design
- **Color Palette:** Matte black (`#0B0B0B`), deep graphite (`#141414`), crisp white, and subtle orange accent (`#FF5A1F` / `#FF6B00`).
- **Responsive & Mobile-First:** Fluid navigation bar, mobile filter drawer, slide-out cart drawer, and interactive size guide modal.
- **Micro-Interactions:** Smooth hover zoom, toast notifications, badges (New, Sale, Low Stock, Sold Out), and loading states.

### 2. Bangladesh Market Localization
- **Currency:** Bangladeshi Taka (**৳ BDT**).
- **Payment Methods:**
  - **Cash on Delivery (COD):** Fully functional doorstep cash collection across all 64 districts in Bangladesh.
  - **bKash & Nagad Integration Interface:** Merchant payment instructions with Transaction ID (`TrxID`) input for manual or gateway reconciliation.
- **Configurable Delivery Rates:**
  - **Inside Dhaka Metropolitan:** ৳80 (1–2 days express delivery).
  - **Outside Dhaka (All 64 Districts):** ৳150 (2–4 days courier dispatch).
  - **Free Delivery:** Automatically applies to orders over ৳4,000.
- **Validation:** 11-digit Bangladeshi phone numbers (`01[3-9]\d{8}`).
- **Order Numbers:** Unique formatted reference numbers (`JG-2026-XXXXX`).

### 3. Shoe Product & Inventory Management
- **Size & Color Variant Stock:** Inventory is tracked by individual shoe size (BD/EU 36–45) and colorway combination.
- **Overselling Prevention:** The server atomically validates inventory during checkout and prevents ordering more pairs than are in stock.
- **Stock Restoration:** Cancelling or returning an order in the admin panel automatically restores the inventory to the database.
- **Size Guide Chart:** Interactive conversion modal showing BD/EU, US, UK sizes, foot length in centimeters and inches, plus measurement instructions.

### 4. Customer Storefront Pages
- **Home Page:** Hero banner carousel, trust badges, category visual cards, best sellers, trending drops, and customer reviews.
- **Shop Catalog:** Product grid with filters (category, brand, gender, size, price slider, sort by price/newest), live search, and pagination.
- **Product Details:** Multi-photo interactive gallery, zoom hover, size selector with real-time stock counters ("Only 2 left!"), color selector, size guide modal, customer reviews, and related shoe recommendations.
- **Shopping Bag:** Slide-out drawer and dedicated Cart page with quantity steppers, promo coupon validation, and subtotal calculations.
- **Checkout:** Customer details, BD phone verification, 64-district selector, payment selection, and instant order creation.
- **Order Confirmation & Live Order Tracking:** Real-time 5-stage shipment progress bar (`JG-2026-XXXXX` + phone lookup).
- **Customer Account:** Login, registration with bcrypt hashing, wishlist bookmarking, and past order history.
- **Support Pages:** About Us, Contact Us (Banani, Dhaka), FAQ, 7-Day Size Exchange Policy, and Privacy Policy.

### 5. Full Admin Dashboard (`/admin`)
- **Protected Routes:** Server-side JWT authorization ensuring only users with the `admin` role can access management endpoints.
- **Overview Dashboard:** Total orders, total revenue (৳), active products count, registered customers, low-stock warnings, and recent orders.
- **Product CRUD:**
  - Add / Edit / Delete shoes.
  - Manage multiple product photos (URL insertion or direct image file upload).
  - Matrix table to set sizes, colors, color hexes, variant SKUs, and stock counts per variant.
- **Order Management:**
  - Filter by order status (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`).
  - Search by order number, customer name, or phone number.
  - Inspection modal showing items, customer shipping address, and bKash/Nagad TrxIDs.
  - Live status updater (Pending -> Confirmed -> Processing -> Shipped -> Delivered).
- **Categories & Brands:** Full CRUD management for silhouettes (Sneakers, Sports, Formals, Loafers, Slides) and brands (Nike, Adidas, Jordan, Apex, Bata, Lotto, Puma, New Balance).
- **Coupons:** Manage promotional discount codes (Percentage or Fixed BDT, minimum spend, expiry date, usage limit).
- **Hero Banners:** Manage promotional banners on the homepage slider.
- **Delivery Settings:** Configure Inside Dhaka fee, Outside Dhaka fee, and free delivery thresholds.
- **Customer Directory:** View registered customers with total lifetime spending.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide React, Axios, React Router v7 |
| **Backend** | Node.js, Express, TypeScript, tsx, JWT, bcryptjs, Multer |
| **Database** | Relational SQLite (`sqlite3` + `sqlite` async wrapper) with foreign keys, indexes, and ACID transactions |
| **Tooling** | Vite 5, PostCSS, Autoprefixer |

---

## 🗄️ Relational Database Schema

```
users (id, email, password_hash, full_name, phone, role, created_at, updated_at)
categories (id, name, slug, description, image_url, display_order, created_at)
brands (id, name, slug, logo_url, description, created_at)
products (id, name, slug, sku, brand_id, category_id, regular_price, sale_price, description, short_description, gender, is_featured, is_trending, is_new_arrival, is_active, created_at, updated_at)
product_images (id, product_id, image_url, is_primary, display_order)
product_variants (id, product_id, size, color, color_hex, sku, stock_quantity, additional_price, created_at, updated_at)
orders (id, order_number, customer_id, customer_name, customer_phone, customer_email, district, area, full_address, notes, payment_method, payment_status, order_status, subtotal, delivery_fee, discount, coupon_code, total_amount, bkash_transaction_id, nagad_transaction_id, created_at, updated_at)
order_items (id, order_id, product_id, variant_id, product_name, product_image, size, color, price, quantity, total)
coupons (id, code, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, usage_limit, used_count, is_active, created_at)
banners (id, title, subtitle, badge, image_url, link_url, button_text, is_active, display_order, created_at)
reviews (id, product_id, user_id, user_name, rating, comment, is_approved, created_at)
delivery_settings (id, inside_dhaka_fee, outside_dhaka_fee, free_delivery_threshold, estimated_days_inside_dhaka, estimated_days_outside_dhaka, updated_at)
wishlists (id, user_id, product_id, created_at)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- npm v10+

### Installation & Environment Setup

1. **Clone or enter the project directory:**
   ```bash
   cd "D:\Jutar ghor"
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Verify Environment Variables:**
   The `server/.env` file is pre-configured:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=jutar_ghor_super_secure_secret_2026_bd_shoes
   CLIENT_URL=http://localhost:3000
   DB_PATH=./jutarghor.db
   ```

5. **Seed the Database with realistic footwear data:**
   ```bash
   cd ../server
   npm run seed
   ```

---

## 🏃 Running the Application

### Option A: Running Backend and Frontend Simultaneously
Open two terminal windows:

**Terminal 1 (Backend Server on port 5000):**
```bash
cd "D:\Jutar ghor\server"
npm run dev
```

**Terminal 2 (Frontend Client on port 3000):**
```bash
cd "D:\Jutar ghor\client"
npm run dev
```

Visit the application in your browser:
- **Customer Storefront:** `http://localhost:3000/`
- **Admin Dashboard:** `http://localhost:3000/admin`
- **Backend API & Health Check:** `http://localhost:5000/api/health`

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@jutarghor.com` | `admin123` | Full access to Admin Dashboard (`/admin`), CRUD, Orders & Stock |
| **Customer** | `rahim@gmail.com` | `customer123` | Customer Storefront, Wishlist, Order History (`/my-orders`) |

> 💡 *On the Login page, you can also use the one-click "Fill Admin" or "Fill Customer" buttons for instant testing.*

---

## 🧪 Running Automated E2E Integration Tests

An automated test suite (`server/test_e2e.js`) is included to verify all database operations, server calculations, and security:
```bash
cd "D:\Jutar ghor\server"
node test_e2e.js
```

**Tested Flows (33/33 assertions):**
1. API health check and BDT (`৳`) currency verification.
2. Admin authentication, JWT token signing, and role verification.
3. Security route protection (unauthorized requests rejected with 401).
4. Product creation with multiple images and size/color variants with stock.
5. Product retrieval by slug and variant relational integrity.
6. Product editing and price updates in SQLite.
7. Customer order placement, Bangladeshi phone validation, district delivery fee calculation, and atomic variant inventory decrement.
8. Server-side overselling prevention (requests exceeding variant stock blocked with 400).
9. Public order tracking by order reference number (`JG-2026-XXXXX`).
10. Admin order status updates and automatic stock restoration upon order cancellation.
11. Product deletion with cascading cleanup.
12. Real-time admin dashboard metrics calculation (revenue, orders, low stock count).
