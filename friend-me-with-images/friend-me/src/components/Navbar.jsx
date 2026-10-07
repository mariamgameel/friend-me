import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Avatar } from "./ui/Avatar";
import {
  Menu,
  X,
  ShoppingBag,
  Heart,
  FileText,
  Package,
  User,
  Shield,
  LogOut,
  ChevronDown
} from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle ESC key for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdoptActive = location.pathname.startsWith("/adopt");
  const isShopActive = location.pathname.startsWith("/shop") || location.pathname.startsWith("/checkout");
  const isAdminActive = location.pathname.startsWith("/admin");

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-container">
        {/* Mobile Hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={24} />
        </button>

        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="brand-dot">🐾</span>
          <span>friend.me</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          <Link to="/adopt" className={isAdoptActive ? "active" : ""}>
            Adopt
          </Link>
          <Link to="/shop" className={isShopActive ? "active" : ""}>
            Shop
          </Link>
          {isAdmin && (
            <Link to="/admin" className={isAdminActive ? "active" : ""}>
              Dashboard
            </Link>
          )}
          <a href="/#contact">Contact us</a>
        </div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Cart Icon */}
          <button
            className="navbar-cart-btn"
            onClick={openCart}
            aria-label={`View cart with ${itemCount} items`}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>

          {user ? (
            <div className="user-menu-wrap" ref={dropdownRef}>
              <button
                className="user-profile-trigger"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
              >
                <Avatar name={user.username} size={36} />
                <span className="user-name-text">{user.username}</span>
                <ChevronDown size={14} className={`dropdown-arrow ${userDropdownOpen ? "open" : ""}`} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu fade-up" role="menu">
                  <div className="dropdown-user-header">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/my-requests" role="menuitem" className="dropdown-item">
                    <FileText size={16} />
                    <span>My Requests</span>
                  </Link>
                  <Link to="/favorites" role="menuitem" className="dropdown-item">
                    <Heart size={16} />
                    <span>Favorites</span>
                  </Link>
                  <Link to="/my-orders" role="menuitem" className="dropdown-item">
                    <Package size={16} />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/profile" role="menuitem" className="dropdown-item">
                    <User size={16} />
                    <span>Profile Settings</span>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" role="menuitem" className="dropdown-item admin-item">
                      <Shield size={16} />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} role="menuitem" className="dropdown-item logout-item">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="guest-actions">
              <Link to="/login">
                <button className="btn-outline" style={{ padding: "8px 18px" }}>
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: "8px 20px" }}>
                  Register
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
                <span className="brand-dot">🐾</span>
                <span>friend.me</span>
              </Link>
              <button
                className="drawer-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close Navigation Menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mobile-drawer-links">
              <Link to="/adopt" className={isAdoptActive ? "active" : ""}>
                Adopt a Dog
              </Link>
              <Link to="/shop" className={isShopActive ? "active" : ""}>
                Pet Shop
              </Link>
              <a href="/#contact" onClick={() => setMobileMenuOpen(false)}>
                Contact Us
              </a>

              {user ? (
                <>
                  <div className="drawer-section-title">My Account</div>
                  <Link to="/my-requests">
                    <FileText size={18} /> My Requests
                  </Link>
                  <Link to="/favorites">
                    <Heart size={18} /> Saved Favorites
                  </Link>
                  <Link to="/my-orders">
                    <Package size={18} /> Order History
                  </Link>
                  <Link to="/profile">
                    <User size={18} /> Profile & Password
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="drawer-admin-link">
                      <Shield size={18} /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout} className="drawer-logout-btn">
                    <LogOut size={18} /> Logout ({user.username})
                  </button>
                </>
              ) : (
                <div className="mobile-drawer-auth">
                  <Link to="/login" style={{ width: "100%" }}>
                    <button className="btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                      Login
                    </button>
                  </Link>
                  <Link to="/register" style={{ width: "100%" }}>
                    <button className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                      Register
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
