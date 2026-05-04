# friend.me – Dog Adoption React App

A full React frontend for the friend.me dog adoption platform, designed to connect with the existing Node.js/Express backend.

## 🎨 Design
- Colors: Pink (#F2A7B8), Black (#1a1a1a), Yellow (#F5D06E), Cream (#faf8f5)
- Fonts: Playfair Display (headings) + DM Sans (body)
- Inspired by the friend.me mockup design

## 📁 Project Structure
```
src/
├── api/
│   ├── axios.js          # Axios instance with JWT interceptor
│   ├── dogs.js           # Dogs API calls
│   ├── adoption.js       # Adoption requests API calls
│   ├── products.js       # Products API calls
│   └── users.js          # Users/Auth API calls
├── context/
│   └── AuthContext.jsx   # Global auth state (login, logout, register)
├── components/
│   ├── Navbar.jsx        # Top navigation bar
│   └── ProtectedRoute.jsx # Route guard for auth & admin
├── pages/
│   ├── Home.jsx          # Landing page (hero + stats + CTAs)
│   ├── Dogs.jsx          # Browse all dogs with filters
│   ├── DogDetail.jsx     # Single dog + adoption request
│   ├── Products.jsx      # Pet shop
│   ├── Login.jsx         # Login form
│   ├── Register.jsx      # Register form
│   └── AdminDashboard.jsx # Admin panel (requests, dogs, products, users)
└── index.css             # Global styles + CSS variables
```

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your backend URL:
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the app
```bash
npm run dev
```

## 🔌 Backend Routes Expected
Make sure your Express backend has these route prefixes:
```
POST   /api/users/register
POST   /api/users/login
GET    /api/users/           (admin only)

GET    /api/dogs/
GET    /api/dogs/:id
POST   /api/dogs/            (admin only)
PUT    /api/dogs/:id         (admin only)
DELETE /api/dogs/:id         (admin only)

GET    /api/products/
POST   /api/products/        (admin only)
PUT    /api/products/:id     (admin only)
DELETE /api/products/:id     (admin only)

POST   /api/adoptions/       (authenticated)
GET    /api/adoptions/       (admin only)
PUT    /api/adoptions/:id    (admin only)
```

## 🔐 Auth Flow
- Token stored in `localStorage` as `"token"`
- Auto-attached to every request via Axios interceptor
- Admin users are redirected to `/admin` after login
- `ProtectedRoute` guards `/admin` from non-admin users

## 📦 Dependencies
- react, react-dom, react-router-dom
- axios
- vite + @vitejs/plugin-react
