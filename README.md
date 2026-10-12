# OFOMS — Online Food Ordering Management System 🍛🛵
> **Software Requirements Specification (SRS) v1.0 Implementation — College Project Prototype**  
> **⚠️ CRITICAL DISCLAIMER:** This web application is a college project prototype. **ALL DATA IS FICTIONAL** — including restaurants, menu items, prices, customer profiles, addresses, delivery personnel, phone numbers, payment accounts, and order history. No real payment gateways or external third-party services are connected.

---

## 🌟 1. Project Overview
**OFOMS** (Online Food Ordering Management System) is a complete, full-stack, modern food ordering and delivery management platform. Built strictly following the SRS Version 1.0 guidelines, OFOMS features multi-role access control, live simulated delivery route tracking, restaurant order fulfillment, real-time inventory toggle, coupon validation, customer reviews, and a system administrator governance portal.

---

## 🎭 2. User Roles & Access Control
The application supports **5 distinct roles** as defined in the SRS:

| Role | Demo Email | Demo Password | Core Responsibilities |
| :--- | :--- | :--- | :--- |
| **CUSTOMER** | `customer@ofoms.demo` | `demo123` | Browse restaurants, customize food, manage cart, checkout, simulate payments, track live delivery, review food. |
| **RESTAURANT MANAGER** | `restaurant@ofoms.demo` | `demo123` | Restaurant dashboard, live order queue (Accept/Preparing/Ready), menu CRUD, stock availability toggle, revenue analytics. |
| **RESTAURANT STAFF** | `staff@ofoms.demo` | `demo123` | Kitchen prep management, order status update queue. |
| **DELIVERY PERSONNEL** | `delivery@ofoms.demo` | `demo123` | Rider app dashboard, accept assignments, update trip status (Picked Up / Out for Delivery / Delivered), live GPS simulation. |
| **SYSTEM ADMINISTRATOR** | `admin@ofoms.demo` | `demo123` | Platform governance, merchant approval/suspension, user status toggle, platform revenue analytics, SRS compliance telemetry. |

---

## 🛠️ 3. Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide React Icons, Recharts, Canvas Confetti.
- **Backend**: Next.js API Routes (RESTful API design).
- **Database**: SQLite with Prisma ORM.
- **Authentication**: JWT-based session state with encrypted cookies and password hashing (`bcryptjs`).
- **Simulations**: Simulated Map Canvas / Telemetry, Simulated Payment Gateway, Presenter Demo Control Panel.

---

## 📁 4. Application Architecture & File Structure

```
ofoms/
├── prisma/
│   ├── schema.prisma       # Database schema (User, Restaurant, MenuItem, Order, Payment, DeliveryAssignment, OrderStatusHistory, etc.)
│   └── seed.ts             # Fictional dataset seeder (10 restaurants, 50+ menu items, 14 users, past orders, coupons)
├── src/
│   ├── app/
│   │   ├── (customer)      # Customer routes: /, /restaurants, /restaurants/[id], /cart, /checkout, /orders, /orders/[id]/track, /profile
│   │   ├── admin/          # Restaurant Manager portal: /admin, /admin/orders, /admin/menu, /admin/reports, /admin/reviews, /admin/settings
│   │   ├── delivery/       # Delivery Partner portal: /delivery, /delivery/orders
│   │   ├── system-admin/   # Platform Administrator portal: /system-admin, /system-admin/restaurants, /system-admin/users
│   │   ├── login/          # Demo login with 1-click account selectors
│   │   ├── register/       # User registration
│   │   └── api/            # REST API Routes (/api/auth, /api/restaurants, /api/cart, /api/orders, /api/payments, /api/demo/controls, etc.)
│   ├── components/         # Reusable UI components (RestaurantCard, FoodCard, DeliveryMap, OrderTimeline, DemoControlPanel, etc.)
│   ├── context/            # React Contexts (AuthContext, CartContext)
│   └── lib/                # Utilities, Prisma Client singleton, Auth JWT helpers
```

---

## 🗄️ 5. Database Schema Overview

Models defined in `prisma/schema.prisma`:
1. `User` (id, email, password, name, phone, role, managedRestaurantId)
2. `Restaurant` (id, name, slug, description, cuisineType, rating, priceRange, isVegOnly, status, lat, lng)
3. `MenuCategory` (id, name, restaurantId)
4. `MenuItem` (id, name, price, description, isVeg, isAvailable, isPopular, customizationsJson)
5. `Cart` & `CartItem` (Single-restaurant cart validation with conflict confirmation modal)
6. `Order` & `OrderItem` (orderNumber, status, subtotal, deliveryFee, tax, total, specialInstructions)
7. `OrderStatusHistory` (Tracks timestamped state progression for every order)
8. `Payment` (Simulated transactionId, status, method)
9. `DeliveryAssignment` (Current rider GPS coordinates, pickupTime, deliveredTime)
10. `Review` (Rating 1-5, comment, restaurant reply)
11. `Coupon` (Discount validation code, maxDiscount, minOrderValue)
12. `Notification` (In-app notifications for order state updates)

---

## 🚀 6. Installation & Quick Start

### Step 1: Clone / Navigate to workspace
```bash
cd "C:\Users\Abhinav R\.gemini\antigravity-ide\scratch\ofoms"
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Set up Environment File
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="ofoms_college_demo_jwt_secret_key_2026"
```

### Step 4: Push Database Schema & Seed Fictional Data
```bash
npx prisma db push
npx prisma db seed
```

### Step 5: Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔄 7. End-to-End College Demonstration Flow

To demonstrate the full application lifecycle during a viva or project presentation:

1. **Login as Customer**:
   - Open `/login` and click **"Customer Demo"** (`customer@ofoms.demo` / `demo123`).
2. **Browse & Select Food**:
   - Go to `/restaurants`, select **"Urban Biryani Co."**.
   - Click **Add** on *Urban Dum Chicken Biryani*, select portion/spice add-ons, and add to cart.
3. **Cart & Coupon**:
   - Open `/cart`. Apply fictional coupon `DEMO50` (50% off discount).
4. **Checkout & Simulated Payment**:
   - Click **Proceed to Checkout**, choose saved address, select **UPI Payment**, and click **Pay & Place Order**.
   - Complete the simulated payment flow.
5. **Track Order (Customer View)**:
   - Redirects to `/orders/[id]/track`. Observe initial status: `PLACED`.
6. **Restaurant Dashboard Processing**:
   - Click **Role Switcher** top bar to **Restaurant Manager** (`/admin`).
   - Find the new order under live queue and click **Accept** → **Preparing** → **Ready for Pickup**.
7. **Delivery Rider App Fulfillment**:
   - Click **Role Switcher** top bar to **Delivery Partner** (`/delivery`).
   - Click **Picked Up** → **Out for Delivery** → **Mark Delivered**.
8. **Customer Live Updates & Review**:
   - Switch back to Customer tracking page. Watch status transition to `DELIVERED`.
   - Click **Rate & Review Food** and submit a 5-star review.
9. **Presenter Demo Controls**:
   - Use the floating **⚡ DEMO CONTROLS** widget in the bottom right corner to instantly trigger new orders, advance order statuses, or reset the dataset.

---

## 🛡️ 8. Security & Compliance
- **Password Security**: Passwords hashed with `bcryptjs`.
- **Role-Based Authorization**: Protected server API routes verify JWT token payload before processing actions.
- **PCI Compliance Disclaimer**: No real card, UPI, or financial data is ever requested or stored.

---

## 🔮 9. Future Scope
- Integration with live payment gateways (Razorpay / Stripe).
- Real-world WebSockets (Socket.io) for instant bi-directional rider map tracking.
- Native mobile applications (React Native / Flutter) for delivery partners.
- AI-driven personalized food recommendations based on customer ordering history.

---
*OFOMS — Online Food Ordering Management System | Software Engineering College Project Prototype*
