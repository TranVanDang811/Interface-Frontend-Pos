# 🛒 POS System – Retail & Cashier Web Application

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-4.5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.10-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Material Tailwind](https://img.shields.io/badge/Material_Tailwind-2.1.4-0284C7)](https://www.material-tailwind.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx&logoColor=white)](https://nginx.org/)

> A modern, responsive, and high-performance Point of Sale (POS) & Store Management frontend application. Designed specifically for retail stores, supermarkets, and convenience businesses with a dual-interface architecture: **Cashier POS Terminal** and **Management Dashboard**.

---

## 📌 Table of Contents

- [🚀 Overview](#-overview)
- [🖼️ Demo Screenshots](#️-demo-screenshots)
- [✨ Key Features](#-key-features)
  - [1. POS Cashier Terminal](#1-pos-cashier-terminal)
  - [2. Cashier Shift Lifecycle](#2-cashier-shift-lifecycle)
  - [3. Manager & Admin Dashboard](#3-manager--admin-dashboard)
  - [4. Inventory & Procurement](#4-inventory--procurement)
  - [5. Role-Based Access Control (RBAC)](#5-role-based-access-control-rbac)
- [🏗️ Technical Architecture](#️-technical-architecture)
  - [State Management & Flow](#state-management--flow)
  - [Authentication & Automatic Token Refresh](#authentication--automatic-token-refresh)
  - [Session Isolation & Multi-Tab Handoff](#session-isolation--multi-tab-handoff)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Directory Structure](#-project-directory-structure)
- [⚙️ Environment Variables](#️-environment-variables)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Available Scripts](#available-scripts)
- [🐳 Docker & Production Deployment](#-docker--production-deployment)
- [🔗 Connected Repositories](#-connected-repositories)

---

## 🚀 Overview

The frontend interface bridges store employees and business managers into a cohesive, real-time retail operation system. It communicates with a Spring Boot REST API backend to ensure immediate consistency across stock levels, shift reconciliations, and financial audits.

### Key Highlights:
- **Dual-Mode Experience**: Fast, keyboard/touch-friendly POS checkout interface (`/pos`) separated from comprehensive administrative analytics (`/dashboard`).
- **Shift Strictness**: Cashiers must verify or initialize active shifts with opening cash balances before issuing receipts.
- **Resilient Authentication**: In-memory/session-first token management with automated token refreshing through Axios request queueing to prevent session drops during checkouts.
- **Production-Ready**: Multi-stage Dockerized container served by Nginx with gzip compression, security headers, and reverse proxy routing.

---


## 🖼️ Demo Screenshots

### 🔐 Authentication & Session Recovery
<img width="1919" height="978" alt="Authentication" src="https://github.com/user-attachments/assets/f4b5c686-1491-4c6a-b0a1-44d6b71495d5" />

### 🛒 Cashier POS Checkout Interface
<img width="1911" height="962" alt="Screenshot 2026-11-09 202454" src="https://github.com/user-attachments/assets/6039e014-cdc9-4099-a4fe-088be94c8c94" />

### 💳 Split / Multi-Method Payment Modal

<img width="1912" height="964" alt="Screenshot 2026-11-09 202622" src="https://github.com/user-attachments/assets/32d1a44b-0dcb-4642-b0e0-4fa7edcddcb1" />

### 💵 End-of-Shift Cash Counting & Settlement
<img width="1919" height="978" alt="Settlement Interface" src="https://github.com/user-attachments/assets/115bb1d8-31e1-417c-891c-95b1dc2588a1" />

### 📦 Product & Inventory Catalog Management
<img width="1915" height="965" alt="Screenshot 2026-11-09 202332" src="https://github.com/user-attachments/assets/260c8d6a-94be-4e5b-86a0-2f528133095d" />

### 📊 Business Intelligence & Reporting Dashboard
<img width="1915" height="962" alt="Screenshot 2026-11-09 202247" src="https://github.com/user-attachments/assets/09497cd7-dbcf-4718-907f-6366350bbd00" />

### 📥 Supplier Import Orders & Stock Receiving
<img width="1915" height="962" alt="Screenshot 2026-11-09 203659" src="https://github.com/user-attachments/assets/2fd4d105-384f-4f30-be3a-bb3fb2514822" />


---

## ✨ Key Features

### 1. POS Cashier Terminal
* **Fast Product Lookup**: Search by SKU, barcode, product name, or filter by category buttons with real-time stock indicators.
* **Smart Shopping Cart**: Increment/decrement quantities, apply custom unit prices or item-level discounts, remove items without state reset.
* **Customer Loyalty Association**: Search existing members by phone/name or register a new customer directly from the cashier counter modal.
* **Promotion & Discount Engine**: Apply order-level discount codes or voucher coupons with automatic recalculation of subtotal, discount value, and tax.
* **Flexible Checkout**: Supports Cash (with real-time change calculation), Bank Transfer / QR code, and Credit Cards.
* **Receipt Management**: Print thermal invoices upon checkout completion, reprint past receipts (`ReprintPos`), or handle product returns/refunds (`RefundModal`).

### 2. Cashier Shift Lifecycle
* **Enforced Guarding**: Blocks checkout actions if the logged-in staff member has not opened a shift.
* **Open Shift Flow**: Record initial cash drawer amount before serving customers.
* **Denomination Counting & Settlement (`SettlementPos`)**: Interactive cash counter breaking down all standard currency notes to compute actual cash vs expected system sales, highlighting discrepancies (overage/shortage).
* **Shift Handover Report**: Generate shift summaries and export PDF reports directly via the backend integration.

### 3. Manager & Admin Dashboard
* **Executive Metrics**: Visual cards for total revenue, total orders, customer growth, and active shifts.
* **Interactive Visualizations**: ApexCharts displaying daily/weekly revenue timelines, product distribution, and sales trajectories.
* **Comprehensive Sales Auditing**:
  * **Sales History (`Payments`)**: View every payment transaction, payment gateway status, and timestamp.
  * **Orders History (`Orders`)**: Filter orders by status (`PENDING`, `COMPLETED`, `CANCELLED`), view full order item breakdowns.
  * **Product Sales Analytics (`ProductsHistory`)**: Granular reports on which items drive the highest margins.

### 4. Inventory & Procurement
* **Product Catalog**: Full CRUD operations, category taxonomy assignment, unit prices, cost prices, stock thresholds, and Cloudinary image upload.
* **Stock Inflow (`ImportOrders`)**: Create and inspect procurement purchase orders from suppliers, automatically updating warehouse stock counts upon confirmation.
* **Supplier Management**: Maintain vendor directory, contact details, and transaction history.
* **Promotions Management**: Configure percentage or fixed-amount discount campaigns, validity date ranges, and usage limits.

### 5. Role-Based Access Control (RBAC)
* Supported Roles: `ADMIN`, `MANAGE`, `EMPLOYEE`.
* **Dynamic Route Protection**: `RoleProtectedRoute` redirects unprivileged staff (e.g., Cashier trying to enter Dashboard) straight to their designated workspace (`/pos`).
* **Dynamic Navigation**: Sidebar adapts menu entries according to the authenticated user's permission matrix.

---

## 🏗️ Technical Architecture

### State Management & Flow
The application uses **Redux Toolkit** configured with 14 modular slices adhering to feature-driven design:
```
src/features/
├── auth/          # Authentication state, current user, tokens, session restoration
├── alert/         # Global toast/alert notifications (success, error, warning)
├── posCart/       # Active POS shopping cart, calculations, applied coupons
├── shift/         # Current shift status, drawer cash tracking, settlement
├── product/       # Product list, filters, selected product, CRUD state
├── category/      # Category taxonomy
├── order/         # Order creation, order histories, status mutations
├── payment/       # Payment records and transaction details
├── importOrder/   # Warehouse procurement receipts
├── supplier/      # Vendor data
├── discount/      # Vouchers and discount rules
├── report/        # Financial stats, charts, top-selling analytics
├── role/          # Dynamic role permissions
└── user/          # Employee directory & user profile management
```

### Authentication & Automatic Token Refresh
To eliminate checkout interruptions due to expired access tokens:
1. Every outgoing request is intercepted by `axiosInstance.jsx` to inject `Authorization: Bearer <token>`.
2. When receiving a `401 Unauthorized` response:
   - Any further 401s are suspended and added to a `failedQueue`.
   - The first request triggers `/auth/refresh` using the stored refresh token.
   - Upon receiving fresh credentials, the `failedQueue` is resolved with the new token and original requests replay transparently.
   - If the refresh token is expired or revoked, session memory is wiped and the user is redirected to `/auth/sign-in`.

### Session Isolation & Multi-Tab Handoff
- Tokens are stored with **`sessionStorage` preference**. This allows an Administrator to open an `EMPLOYEE` cashier tab and an `ADMIN` dashboard tab side-by-side in the same browser without session overwrite.
- A cross-tab handoff token mechanism (`admin_handoff_token`) allows authorized supervisors to inspect the dashboard from POS view in a new window smoothly.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Core Framework** | [React 18.2](https://react.dev/) | Component-based UI library |
| **Build Tool** | [Vite 4.5](https://vitejs.dev/) | Fast build tool & ESM dev server |
| **State Management** | [Redux Toolkit 2.10](https://redux-toolkit.js.org/) + `react-redux` | Scalable predictable state container |
| **Routing** | [React Router DOM 6.17](https://reactrouter.com/) | Client-side routing with Code Splitting |
| **Styling** | [Tailwind CSS 3.3](https://tailwindcss.com/) | Utility-first styling engine |
| **UI Components** | [Material Tailwind 2.1.4](https://www.material-tailwind.com/) | Material Design components for React |
| **Icons** | [@heroicons/react 2.0](https://heroicons.com/) + FontAwesome 6 | SVG icons |
| **Charts** | [ApexCharts 3.44](https://apexcharts.com/) + `react-apexcharts` | Interactive dashboard visualization charts |
| **HTTP Client** | [Axios 1.13](https://axios-http.com/) | Promise-based HTTP client with Interceptors |
| **Container & Proxy** | [Docker](https://www.docker.com/) + [Nginx Alpine](https://nginx.org/) | Multi-stage build container & reverse proxy |

---

## 📂 Project Directory Structure

```plaintext
frontend/
├── public/                 # Static assets, favicon, public icons
├── src/
│   ├── app/
│   │   ├── rootReducer.jsx # Root combination of 14 Redux feature slices
│   │   └── store.jsx       # Configured Redux Toolkit store instance
│   ├── components/         # Common UI components (RoleProtectedRoute, etc.)
│   ├── configs/            # Configuration presets and constants
│   ├── context/            # React Context providers for theme/UI states
│   ├── features/           # Redux feature slices, thunks, and async actions
│   │   ├── auth/           # Login, logout, restoreSession
│   │   ├── posCart/        # Cart calculations, line items, customer binding
│   │   ├── shift/          # Shift check, open/close shift
│   │   └── ...             # product, order, payment, importOrder, report, etc.
│   ├── hooks/              # Custom reusable React hooks
│   ├── layouts/
│   │   ├── auth.jsx        # Layout wrapper for Sign In / Sign Up
│   │   ├── dashboard.jsx   # Layout wrapper for Admin/Manage Dashboard
│   │   └── pos.jsx         # Fullscreen layout wrapper for Cashier POS
│   ├── pages/
│   │   ├── auth/           # SignIn, SignUp, ChangePassword
│   │   ├── dashboard/      # Home (charts), Products, Orders, Payments, Users, etc.
│   │   ├── pos/            # PosManage, PaymentPage, OpenShift, SettlementPos, ReprintPos
│   │   ├── category/       # Category create/edit pages
│   │   ├── product/        # AddProduct modal/page
│   │   ├── discount/       # AddDiscount modal/page
│   │   ├── importOder/     # ImportOrderCreate procurement page
│   │   ├── supplier/       # Supplier addition modal/page
│   │   └── user/           # AddUser, UserDetail pages
│   ├── services/
│   │   └── axiosInstance.jsx # Central Axios instance with JWT refresh queue
│   ├── utils/              # Helper utilities, GlobalAlert toasts, formatters
│   ├── widgets/            # Dashboard cards, charts, and layout widgets
│   ├── App.jsx             # Main App component with lazy routes & route guards
│   ├── main.jsx            # React root mount with Redux Provider & BrowserRouter
│   └── routes.jsx          # Declarative route configuration with RBAC permissions
├── .env.example            # Environment variables blueprint
├── Dockerfile              # Production multi-stage Docker build recipe
├── nginx.conf              # Production Nginx reverse-proxy & caching rules
├── package.json            # Dependencies and npm script definitions
├── tailwind.config.cjs     # Tailwind CSS theme customizations
└── vite.config.js          # Vite build configuration with alias resolution
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `frontend` directory by copying the template:

```bash
cp .env.example .env
```

| Variable | Description | Example (Local Dev) | Example (Production / Docker) |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of the Spring Boot Backend API | `http://localhost:8080/backend` | `/backend` (proxied via Nginx) |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.x or higher installed ([Download Node.js](https://nodejs.org/))
* **npm**: v9.x or higher (comes with Node.js)
* **Backend API**: The [POS Backend API](https://github.com/TranVanDang811/StorePosSystem.git) running locally on port `8080` (or accessible remotely).

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TranVanDang811/Interface-Frontend-Pos.git
   cd Interface-Frontend-Pos
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   # Create .env file
   echo "VITE_API_BASE_URL=http://localhost:8080/backend" > .env
   ```

4. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```
   * The application will run at: `http://localhost:5173/` (or the port specified in terminal).

### Available Scripts

* `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
* `npm run build`: Bundles the project into optimized static files inside `/dist`.
* `npm run preview`: Previews the production build locally before deployment.

---

## 🐳 Docker & Production Deployment

The project includes a multi-stage `Dockerfile` and custom `nginx.conf` designed for lightweight, high-performance production hosting.

### Architecture in Docker:
1. **Stage 1 (`build`)**: Installs dependencies and compiles the React application using `node:18-alpine`.
2. **Stage 2 (`serve`)**: Copies `/dist` output to a lean `nginx:alpine` image with:
   - Gzip compression for static text/js/css.
   - 1-year immutable caching for static hashed assets (`.js`, `.css`, fonts, images).
   - Zero-cache rule for `index.html` to guarantee instant client updates on releases.
   - Built-in reverse proxy routing `/backend/` calls to `http://backend:8080/backend/`.
   - Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`).

### Build & Run Container:

```bash
# 1. Build the Docker image
docker build -t pos-frontend .

# 2. Run container on port 80
docker run -d -p 80:80 --name pos-frontend-app pos-frontend
```

### Docker Compose Integration

When running with the entire full-stack ecosystem:

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pos-frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - pos-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pos-backend
    restart: always
    ports:
      - "8080:8080"
    networks:
      - pos-network

networks:
  pos-network:
    driver: bridge
```

---

## 🔗 Connected Repositories

* 🌐 **Frontend Repository**: [Interface-Frontend-Pos](https://github.com/TranVanDang811/Interface-Frontend-Pos.git)
* ⚙️ **Backend Repository**: [StorePosSystem (Spring Boot)](https://github.com/TranVanDang811/StorePosSystem.git)

---

<p align="center">
  Crafted with ❤️ for modern retail operations.
</p>
