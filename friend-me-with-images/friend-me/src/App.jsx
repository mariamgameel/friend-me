import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { CartProvider } from "./context/CartContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ScrollToTop from "./components/common/ScrollToTop";
import NotFound from "./components/common/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { Spinner } from "./components/ui/Avatar";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dogs from "./pages/Dogs";
import DogDetail from "./pages/DogDetail";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <FavoritesProvider>
              <Router>
                <ScrollToTop />
                <Navbar />
                <Suspense fallback={<Spinner size={40} />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/adopt" element={<Dogs />} />
                    <Route path="/adopt/:id" element={<DogDetail />} />
                    <Route path="/shop" element={<Products />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </FavoritesProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
