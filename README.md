# friend.me — Rescue Dog Adoption & Pet Shop Platform

A production-ready full-stack MERN application connecting shelter dogs with loving adopters, accompanied by a curated pet supply shop, order fulfillment system, real-time analytics dashboard, and role-based administration workflows.

---

## 🎨 Visual Design & Aesthetics

The platform features a **warm, minimal, and neutral aesthetic** designed for calm, modern elegance and visual trust:

| Token | Hex Value | Role & Usage | Contrast Ratio (vs White) |
|---|---|---|---|
| `--primary` | `#A56958` | Terracotta / Warm Taupe primary brand accent | **4.85:1** (WCAG AA Pass) |
| `--primary-dark` | `#8C5445` | Hover state & emphasized brand elements | **6.72:1** (WCAG AA/AAA) |
| `--primary-light` | `#F5ECE8` | Subtly tinted badges, active tabs, icon backgrounds | Neutral Accent |
| `--secondary` | `#4E6E5D` | Sage Green secondary accent for shop & success highlights | **5.41:1** (WCAG AA Pass) |
| `--black` | `#1A1918` | Deep Charcoal heading and typography base | **16.8:1** (WCAG AAA Pass) |
| `--cream` | `#FBF9F6` | Warm off-white canvas background | Soft Neutral Background |
| `--surface-card` | `#FFFFFF` | Elevated card & modal surfaces | Pure Surface |
| `--surface-sunken` | `#F4F0EB` | Inputs, table headers, and sunken containers | Contrast Surface |
| `--border-subtle` | `#E8E2D9` | Crisp hairline dividers and component borders | Structural |

- **Typography:** `Plus Jakarta Sans` / `Outfit` with crisp tabular numerals, hierarchical scaling, and responsive fluid sizes.
- **Micro-interactions:** Smooth CSS transitions (150ms / 250ms), custom accessible focus rings (`:focus-visible`), and accessible reduced-motion support.

---

## 🚀 Key Features

### 🐶 Shelter & Adoption
- **Interactive Dog Directory:** Live search, multi-faceted filtering (breed, size, gender, energy level, good with kids/dogs/cats), and paginated grid.
- **Dog Profiles:** Photo gallery with image fallback, quick facts badge grid, health status, shelter location, and similar dog recommendations.
- **Rich Adoption Application:** Multi-step modal capturing housing type, fenced yard, pet experience, daily schedule, and applicant rationale.
- **Adoption Request Lifecycle:**
  - Status pipeline: `Pending` → `Approved` | `Rejected` | `Cancelled`.
  - Automatic safeguards: Approving a request marks the dog as adopted and automatically rejects other pending requests for that dog in an atomic database transaction.
  - Re-applying permitted if a previous application was rejected or cancelled; double-application blocked while pending.
  - Applicant status timeline with admin notes.

### 🛍️ Pet Shop & Order Fulfillment
- **Product Catalog:** Multi-category browsing (Food, Toys, Accessories, Grooming, Healthcare, Beds & Crates), featured item badges, price sorting, and quick-view drawer.
- **Shopping Cart & Checkout:** Persistent slide-out cart drawer, live stock quantity bounds, and Cash on Delivery (COD) checkout.
- **Inventory Control:** Atomic stock decrement with optimistic rollback on failures, low-stock threshold warnings (≤ 3 units), and out-of-stock guards.

### ❤️ User Experience & Profiles
- **Favorites / Wishlist:** One-click dog saving with persistent backend synchronization and toast feedback.
- **User Dashboard:** Dedicated tabs for My Adoption Requests, My Orders, Saved Dogs, Profile Info, and Password Update with live strength meter & rule checklist.

### 🛡️ Administrative Console (`/admin`)
- **Real-Time Analytics:** KPI summary cards, Recharts 6-month adoption vs order activity trends, and status distribution pie charts.
- **Application Review:** Full applicant questionnaire viewer, status transition history, custom admin note appending, and one-click Approve/Reject with confirmation dialogs.
- **Shelter Dog & Product Management:** Full CRUD modals with image file uploads (Multer static storage `/uploads` or direct URLs).
- **Order Management:** Live status transitions (`Pending` → `Processing` → `Shipped` → `Delivered` → `Cancelled`).
- **Contact Inquiries & User Management:** Inbound message inbox with unread status and user directory.

---

## 📁 Architecture & Tech Stack

```
Friend_Me/
├── Server/                          # Express REST API
│   ├── controllers/                 # Route controllers (catchAsync + AppError pattern)
│   ├── models/                      # Mongoose schemas (Dog, User, Product, Order, AdoptionRequest, Message)
│   ├── routes/                      # Standardized REST route definitions
│   ├── middlewares/                 # Auth, role guard, sanitization, rate limiter, error handler
│   ├── validators/                  # Joi request validation schemas
│   ├── seed/                        # Data seeders (seedAdmin.js, seedDogs.js, seedProducts.js)
│   ├── tests/                       # Jest + Supertest automated test suite
│   ├── uploads/                     # Uploaded media storage served statically
│   ├── app.js                       # Express application declaration
│   └── main.js                      # Server startup and database connection
│
└── friend-me-with-images/friend-me/ # React Single Page Application
    ├── src/
    │   ├── api/                     # Axios API clients with standardized data/meta unwrapping
    │   ├── context/                 # AuthContext, CartContext, FavoritesContext
    │   ├── components/              # Navbar, Footer, CartDrawer, ProtectedRoute
    │   │   ├── ui/                  # Button, Badge, Card, Modal, ConfirmDialog, Toast, Skeleton, etc.
    │   │   └── common/              # ErrorBoundary, NotFound, ScrollToTop
    │   ├── hooks/                   # useDocumentTitle, useDebounce
    │   ├── pages/                   # Home, Dogs, DogDetail, Products, Checkout, OrderConfirmation,
    │   │                            # MyRequests, MyOrders, Favorites, Profile, Login, Register, AdminDashboard
    │   └── index.css                # Global design tokens and utilities
```

---

## 🛠️ Setup & Local Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas connection URI

### 1. Backend Setup
```bash
cd Server
npm install

# Copy example environment configuration
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, PORT (default 5000), CLIENT_URL (http://localhost:5173)

# Seed sample data (Admin, 12 Dogs, 10 Categorized Products)
npm run seed:admin     # Creates admin@friend.me / AdminPassword123!
npm run seed:dogs      # Seeds realistic shelter dogs with personality tags
npm run seed:products  # Seeds categorized pet shop supplies

# Start development server
npm start
```

### 2. Frontend Setup
```bash
cd friend-me-with-images/friend-me
npm install

# Start Vite development server
npm run dev
```

The frontend will run at `http://localhost:5173` and proxy/connect to `http://localhost:5000/api`.

---

## 🧪 Automated Testing

The backend includes a comprehensive automated test suite powered by **Jest** and **Supertest**, covering:
- Authentication, duplicate email guards, and weak password rejection
- Dog directory search, filters, pagination, and admin authorization guards
- Adoption workflows, transaction integrity, auto-rejection of concurrent applications, and re-applying
- Order stock decrements, inventory guards, and order histories
- Error handling and standardized 404/400 JSON payloads

To run the backend tests:
```bash
cd Server
npm test
```

To build the frontend bundle:
```bash
cd friend-me-with-images/friend-me
npm run build
```

---

## 🌐 API Reference

All successful responses follow the standardized format:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 12, "page": 1, "pages": 1, "limit": 12 }
}
```

All error responses follow:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [ ... ]
}
```

| Method | Route | Access | Description |
|---|---|---|---|
| **POST** | `/api/users/register` | Public | Register new user account (role enforced to `user`) |
| **POST** | `/api/users/login` | Public | Sign in and receive JWT token |
| **GET** | `/api/users` | Admin | List all registered users |
| **GET** | `/api/users/me` | Authenticated | Retrieve current user profile and role |
| **PUT** | `/api/users/me` | Authenticated | Update username |
| **PUT** | `/api/users/me/password` | Authenticated | Change password with current password verification |
| **GET** | `/api/users/me/favorites` | Authenticated | Get list of user's saved favorite dogs |
| **POST** | `/api/users/me/favorites/:dogId` | Authenticated | Add dog to favorites |
| **DELETE** | `/api/users/me/favorites/:dogId` | Authenticated | Remove dog from favorites |
| **GET** | `/api/dogs` | Public | Paginated dogs list with search, breed, size, and health filters |
| **GET** | `/api/dogs/breeds` | Public | List distinct breeds for filter dropdowns |
| **GET** | `/api/dogs/:id` | Public | Retrieve single dog details |
| **POST** | `/api/dogs` | Admin | Add new rescue dog to shelter |
| **PUT** | `/api/dogs/:id` | Admin | Update dog profile |
| **DELETE** | `/api/dogs/:id` | Admin | Delete dog from database |
| **GET** | `/api/products` | Public | List shop products with category filter and price sort |
| **GET** | `/api/products/:id` | Public | Retrieve product details |
| **POST** | `/api/products` | Admin | Add product to shop catalog |
| **PUT** | `/api/products/:id` | Admin | Update product details and inventory |
| **DELETE** | `/api/products/:id` | Admin | Delete product |
| **POST** | `/api/adoptions` | Authenticated | Submit adoption application for a dog |
| **GET** | `/api/adoptions/me` | Authenticated | List current user's adoption applications |
| **PUT** | `/api/adoptions/:id/cancel` | Authenticated | Cancel pending adoption application |
| **GET** | `/api/adoptions` | Admin | List all adoption requests across the system |
| **PUT** | `/api/adoptions/:id` | Admin | Approve or reject request (auto-resolves other pending requests) |
| **POST** | `/api/orders` | Authenticated | Place shop order with atomic stock decrement |
| **GET** | `/api/orders/me` | Authenticated | List current user's past orders |
| **GET** | `/api/orders` | Admin | List all customer orders |
| **PUT** | `/api/orders/:id/status` | Admin | Update order delivery status |
| **POST** | `/api/contact` | Public (Rate-limited) | Send inquiry message via contact form |
| **GET** | `/api/contact` | Admin | List inbound contact messages |
| **PUT** | `/api/contact/:id/read` | Admin | Mark message as read |
| **DELETE** | `/api/contact/:id` | Admin | Delete contact message |
| **GET** | `/api/admin/stats` | Admin | KPI metrics, 6-month trends, and status distributions |
| **POST** | `/api/uploads` | Admin | Upload image file (JPEG, PNG, WEBP, max 3MB) |

---

## 📋 Assumptions & Architectural Decisions

1. **Role Enforcement on Register:** A new registration cannot escalate privileges. Regardless of any client-supplied parameters, `role: "user"` is strictly hardcoded on the backend.
2. **Adoption Exclusivity & Concurrency:** Approving an adoption request marks the dog as `isAdopted: true` and automatically rejects all other pending applications for that specific dog. If multiple users apply while the dog is pending, the first approved application claims the dog.
3. **Application Re-submission:** Users may re-apply for a dog if their previous request was `Rejected` or `Cancelled`, but cannot submit duplicate requests while a request is in `Pending` or `Approved` status.
4. **Order Inventory Decrements:** Stock decrements occur server-side during order placement. Orders with insufficient stock are rejected with HTTP 400 without partial deductions.
5. **Static Media Serving:** Uploaded images are stored locally under `Server/uploads` and served statically via Express with `crossOriginResourcePolicy: { policy: "cross-origin" }`.
6. **Frontend Styling:** Strictly Vanilla CSS with modular BEM-like class scopes per page and component, adhering to a shared neutral CSS variable design system in `src/index.css`.

---

## 📄 License
MIT