import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">friend.me</Link>
      <div className="navbar-links">
        <Link to="/adopt" className={location.pathname === "/adopt" ? "active" : ""}>Adopt</Link>
        <Link to="/shop" className={location.pathname === "/shop" ? "active" : ""}>Shop</Link>
        {isAdmin && <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>Dashboard</Link>}
        <Link to="/#contact">Contact us</Link>
      </div>
      <div className="navbar-actions">
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.username}</span>
            <button className="btn-outline" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="btn-outline">Login</button></Link>
            <Link to="/register"><button className="btn-primary">Register</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}
