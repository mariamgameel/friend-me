import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { getErrorMessage } from "../utils/error";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Heart,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import "./Auth.css";

export default function Register() {
  useDocumentTitle("Create Account | friend.me");
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password rules validation
  const hasMinLength = form.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const passwordsMatch = form.password.length > 0 && form.password === form.confirmPassword;

  // Password strength score 0 to 4
  const calculateStrength = () => {
    let score = 0;
    if (form.password.length >= 8) score++;
    if (form.password.length >= 12) score++;
    if (/[a-zA-Z]/.test(form.password) && /\d/.test(form.password)) score++;
    if (/[^a-zA-Z0-9]/.test(form.password)) score++;
    return score;
  };

  const strength = calculateStrength();
  const strengthColors = ["var(--danger)", "#d97706", "var(--secondary)", "var(--success)"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setError("Password must be at least 8 characters and contain both letters and numbers.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("Account created successfully! Please sign in.");
      navigate("/login");
    } catch (err) {
      const msg = getErrorMessage(err, "Registration failed.");
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Hero Banner */}
        <div className="auth-banner">
          <div className="auth-banner-top">
            <Link to="/" className="auth-brand">
              <Heart size={24} className="auth-brand-paw" fill="currentColor" />
              <span>friend.me</span>
            </Link>
            <h2 className="auth-banner-quote">
              "Saving one dog will not change the world, but surely for that one dog, the world will change forever."
            </h2>
            <p className="auth-banner-sub">
              Join hundreds of pet lovers giving shelter companions a second chance at happiness.
            </p>
          </div>

          <div className="auth-banner-footer">
            <div className="auth-stat-row">
              <div className="auth-stat-item">
                <span className="auth-stat-val">100%</span>
                <span className="auth-stat-lbl">Free To Adopt</span>
              </div>
              <div className="auth-stat-item">
                <span className="auth-stat-val">Transparent</span>
                <span className="auth-stat-lbl">Adoption Review</span>
              </div>
              <div className="auth-stat-item">
                <span className="auth-stat-val">Support</span>
                <span className="auth-stat-lbl">Post-Adoption Advice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="auth-form-card">
          <div className="auth-header">
            <h1>Create an account</h1>
            <p>Start your adoption journey with friend.me</p>
          </div>

          {error && (
            <div className="auth-error-banner">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <FormField label="Username" required>
              <div className="auth-input-wrap">
                <User size={18} className="auth-icon-left" />
                <input
                  type="text"
                  placeholder="johndoe"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  maxLength={30}
                  required
                  autoFocus
                />
              </div>
            </FormField>

            <FormField label="Email Address" required>
              <div className="auth-input-wrap">
                <Mail size={18} className="auth-icon-left" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </FormField>

            <FormField label="Password" required>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-icon-left" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters with letter & number"
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

              {form.password && (
                <div className="auth-strength-bar">
                  <div
                    className="auth-strength-fill"
                    style={{
                      width: `${(strength / 4) * 100}%`,
                      backgroundColor: strengthColors[Math.max(0, strength - 1)] || "var(--danger)",
                    }}
                  />
                </div>
              )}
            </FormField>

            <FormField label="Confirm Password" required>
              <div className="auth-input-wrap">
                <Lock size={18} className="auth-icon-left" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </FormField>

            {/* Live Password Rules */}
            <div className="auth-rules-box">
              <span className="auth-rules-title">Password Checklist</span>
              <ul className="auth-rules-list">
                <li className={`auth-rule-item ${hasMinLength ? "met" : "unmet"}`}>
                  {hasMinLength ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>8+ characters</span>
                </li>
                <li className={`auth-rule-item ${hasLetter ? "met" : "unmet"}`}>
                  {hasLetter ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>At least 1 letter</span>
                </li>
                <li className={`auth-rule-item ${hasNumber ? "met" : "unmet"}`}>
                  {hasNumber ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>At least 1 number</span>
                </li>
                <li className={`auth-rule-item ${passwordsMatch ? "met" : "unmet"}`}>
                  {passwordsMatch ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="auth-submit-btn"
              disabled={loading || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch}
            >
              Create Account <ArrowRight size={18} />
            </Button>
          </form>

          <div className="auth-footer-links">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
