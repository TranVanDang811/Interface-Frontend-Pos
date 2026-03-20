# 💻 Frontend Application

The frontend of this POS system is built with React, TypeScript, and Redux Toolkit, providing a fast, scalable, and user-friendly interface for retail operations.

It is designed to handle real-world scenarios such as order processing, shift management, authentication, and reporting, with a focus on performance and maintainability.

## 🎯 Key Responsibilities

Provide an intuitive POS interface for creating and managing orders

Handle authentication and authorization (JWT + refresh token)

Manage application state efficiently using Redux Toolkit

Integrate seamlessly with backend REST APIs

Ensure responsive and smooth user experience across devices

## 🧩 Core Features
### 🛒 POS & Order Management

Add/remove products to cart without resetting previous items

Real-time total price calculation

Order submission with default status handling

Display detailed order information (product name, price, quantity, total)

### 👨‍💼 Shift Management

Automatically check current shift after login

Prevent operations if no active shift

Open / Close shift flow with validation

Cash counting UI when closing shift

### 👥 User Management

Create, update, delete users

Update user info via modal (UX-friendly)

Dynamic role selection from API

Enable/disable user status

### 📦 Product Management

Display product list with images

Upload images via Cloudinary integration

Manage stock and product details

### 📊 Reports & Dashboard

Revenue statistics

Top-selling products

Filter data by time range

Export reports (PDF integration from backend)

### 🔐 Authentication Flow

Login with JWT

Store access token & refresh token in localStorage

Automatically refresh token using Axios Interceptor

Handle 401 errors and redirect to login when needed

### ⚙️ Tech Stack

React – UI Library

TypeScript – Type safety

Redux Toolkit – State management

React Router – Navigation

Axios – API communication

Material Tailwind – UI components

### 🧠 Architecture Highlights

Feature-based folder structure (scalable & maintainable)

Separation of concerns (UI / logic / API calls)

Centralized API handling with Axios instance

Reusable components and hooks

Clean integration with backend using DTO-based responses

### 🚀 Performance & UX

Optimized rendering with memoization

Minimal re-renders using Redux best practices

Responsive UI for different screen sizes

Clear feedback using alerts and loading states

### 📌 Future Improvements

Real-time updates (WebSocket)

Advanced dashboard charts

Offline mode support

Mobile-friendly POS layout

# 🚀 Live Demo

🌐 Frontend: [](https://github.com/TranVanDang811/Interface-Frontend-Pos.git)

🔗 Backend API: [](https://github.com/TranVanDang811/StorePosSystem.git)
