# friend.me — Dog Adoption & Pet Shop Platform

A full-stack MERN application connecting shelter dogs with adopters, with an integrated pet supply shop and role-based admin dashboard.

## Tech Stack
**Backend:** Node.js, Express 5, MongoDB (Mongoose), JWT auth, Joi validation, bcrypt
**Frontend:** React 18, Vite, React Router, Axios

## Design
- Colors: Pink `#F2A7B8`, Black `#1a1a1a`, Yellow `#F5D06E`, Cream `#faf8f5`
- Fonts: Playfair Display (headings) + DM Sans (body)

## Features
- JWT authentication with role-based access control (user / admin)
- Dog listings with detail pages and adoption request workflow
- Admin dashboard for managing dogs, products, and adoption requests
- Pet shop with product catalog
- Centralized error handling and request validation middleware

## Project Structure
```
Server/                              # Express API
  controllers/                        # Route handlers
  models/                                # Mongoose schemas
  routes/                                  # API route definitions
  middlewares/                        # Auth, role guard, validation, error handling
  validators/                            # Joi schemas
  utils/                                      # catchAsync, AppError

friend-me-with-images/friend-me/     # React frontend
  src/
    api/                # Axios API calls (axios.js, dogs.js, adoption.js, products.js, users.js)
    context/            # AuthContext.jsx — global auth state (login, logout, register)
    components/         # Navbar.jsx, ProtectedRoute.jsx
    pages/              # Home, Dogs, DogDetail, Products, Login, Register, AdminDashboard
    index.css           # Global styles + CSS variables
```

## Setup

### Backend
```bash
cd Server
npm install
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm start
```

### Frontend
```bash
cd friend-me-with-images/friend-me
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm run dev
```

## API Reference

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/users/register` | Public | Register a new user |
| POST | `/api/users/login` | Public | Log in, returns JWT |
| GET | `/api/users` | Admin | List all users |
| GET | `/api/dogs` | Public | List all dogs |
| GET | `/api/dogs/:id` | Public | Get a single dog |
| POST | `/api/dogs` | Admin | Add a dog |
| PUT | `/api/dogs/:id` | Admin | Update a dog |
| DELETE | `/api/dogs/:id` | Admin | Remove a dog |
| GET | `/api/products` | Public | List products |
| POST | `/api/products` | Admin | Add a product |
| PUT | `/api/products/:id` | Admin | Update a product |
| DELETE | `/api/products/:id` | Admin | Remove a product |
| POST | `/api/adoptions` | Authenticated | Submit an adoption request |
| GET | `/api/adoptions` | Admin | List all requests |
| PUT | `/api/adoptions/:id` | Admin | Approve/reject a request |

## Auth Flow
- JWT stored in `localStorage` as `"token"`, auto-attached to every request via an Axios interceptor
- Admin users are redirected to `/admin` after login
- `ProtectedRoute` guards `/admin` from non-admin users

## License
MIT