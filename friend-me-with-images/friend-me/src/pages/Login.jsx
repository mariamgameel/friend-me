import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { getErrorMessage } from "../utils/error";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { Mail, Lock, Eye, EyeOff, Heart, AlertCircle, ArrowRight } from "lucide-react";
import "./Auth.css";

export default function Login() {
  useDocumentTitle("Log In | friend.me");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Where to go after login: state.from > admin redirect > home
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.username || "friend"}!`);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const msg = getErrorMessage(err, "Login failed. Please check your credentials.");
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminPrefill = () => {
    setForm({
      email: "admin@friend.me",
      password: "AdminPassword123!",
    });
    toast.info("Prefilled demo Admin credentials");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Inspirational Banner */}
        <div className="auth-banner">
          <div className="auth-banner-top">
            <Link to="/" className="auth-brand">
              <Heart size={24} className="auth-brand-paw" fill="currentColor" />
              <span>friend.me</span>
            </Link>
            <h2 className="auth-banner-quote">
              "Until one has loved an animal, a part of one's soul remains unawakened."
            </h2>
            <p className="auth-banner-sub">
              Sign in to manage your adoption applications, favorite shelter companions, and pet shop orders.
            </p>
          </div>

          <div className="auth-banner-footer">
            <div className="auth-stat-row">
              <div className="auth-stat-item">
                <span className="auth-stat-val">250+</span>
                <span className="auth-stat-lbl">Happy Adoptions</span>
              </div>
              <div className="auth-stat-item">
                <span className="auth-stat-val">100%</span>
                <span className="auth-stat-lbl">Vaccinated & Loved</span>
              </div>
              <div className="auth-stat-item">
                <span className="auth-stat-val">24/7</span>
                <span className="auth-stat-lbl">Care & Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div className="auth-header">
            <h1>Welcome back</h1>
            <p>Enter your details to sign in to your friend.me account</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Email Address" required>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-icon-left" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoFocus
                />
              </div>
            </FormField>

            <FormField label="Password" required>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="auth-submit-btn"
            >
              Sign In <ArrowRight size={18} />
            </Button>
          </form>

          {/* Quick Demo Pre-fill Box */}
          <div className="admin-tip-box">
            <span>Demo Admin access?</span>
            <button type="button" onClick={handleAdminPrefill}>
              Prefill Admin Credentials
            </button>
          </div>

          <div className="auth-footer-links">
            Don't have an account yet? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
