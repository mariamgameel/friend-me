import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import api from "../api/axios";
import { getErrorMessage } from "../utils/error";
import useDocumentTitle from "../hooks/useDocumentTitle";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Card from "../components/ui/Card";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  FileText,
  ShoppingBag,
  Heart,
  LogOut,
} from "lucide-react";
import "./Profile.css";

export default function Profile() {
  useDocumentTitle("My Profile | friend.me");
  const { user, login: setAuthUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Profile info state
  const [username, setUsername] = useState(user?.username || "");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Validation rules for new password
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Password strength calculation (0 to 4)
  const calculateStrength = () => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;
    return score;
  };

  const strength = calculateStrength();
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["var(--danger)", "#d97706", "var(--secondary)", "var(--success)"];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    setProfileSaving(true);
    try {
      const res = await api.put("/users/me", { username: username.trim() });
      if (res.data?.data) {
        setAuthUser(res.data.data, localStorage.getItem("token"));
      }
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!hasMinLength || !hasLetter || !hasNumber) {
      toast.error("New password does not meet the requirements");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPwSaving(true);
    try {
      await api.put("/users/me/password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to change password"));
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.info("You have been signed out");
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header Hero Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-wrap">
            <Avatar name={user?.username || "User"} size={84} />
          </div>
          <div className="profile-info-wrap">
            <div className="profile-name-badge">
              <h1>{user?.username}</h1>
              <Badge variant={user?.role === "admin" ? "primary" : "neutral"}>
                <Shield size={12} />
                {user?.role === "admin" ? "Administrator" : "Community Member"}
              </Badge>
            </div>
            <div className="profile-meta-row">
              <span className="profile-meta-item">
                <Mail size={15} /> {user?.email}
              </span>
              <span className="profile-meta-item">
                <Calendar size={15} /> Joined {formattedDate}
              </span>
            </div>
          </div>
          <div className="profile-header-actions">
            <Button variant="ghost" size="sm" onClick={handleLogout} className="logout-btn">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Nav Shortcut Pills */}
        <div className="profile-shortcuts">
          <Link to="/my-requests" className="shortcut-card">
            <div className="shortcut-icon req-icon">
              <FileText size={20} />
            </div>
            <div>
              <div className="shortcut-title">Adoption Requests</div>
              <div className="shortcut-desc">Track status and timelines</div>
            </div>
          </Link>
          <Link to="/my-orders" className="shortcut-card">
            <div className="shortcut-icon order-icon">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="shortcut-title">Order History</div>
              <div className="shortcut-desc">View pet shop purchases</div>
            </div>
          </Link>
          <Link to="/favorites" className="shortcut-card">
            <div className="shortcut-icon fav-icon">
              <Heart size={20} />
            </div>
            <div>
              <div className="shortcut-title">Saved Dogs</div>
              <div className="shortcut-desc">Your favorite rescues</div>
            </div>
          </Link>
        </div>

        {/* Main Grid: Account Details & Password Change */}
        <div className="profile-grid">
          {/* Card 1: Account Details */}
          <Card className="profile-card">
            <div className="card-heading">
              <User size={20} />
              <div>
                <h2>Account Details</h2>
                <p>Update your personal information</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form">
              <FormField label="Email Address" helperText="Your email address cannot be changed">
                <div className="input-disabled-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" value={user?.email || ""} disabled className="input-disabled" />
                </div>
              </FormField>

              <FormField label="Display Username" required>
                <div className="input-with-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    maxLength={30}
                    required
                  />
                </div>
              </FormField>

              <div className="form-submit-row">
                <Button
                  type="submit"
                  variant="primary"
                  loading={profileSaving}
                  disabled={profileSaving || username.trim() === user?.username}
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Card 2: Security & Password */}
          <Card className="profile-card">
            <div className="card-heading">
              <Lock size={20} />
              <div>
                <h2>Change Password</h2>
                <p>Ensure your account remains safe and secure</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="profile-form">
              <FormField label="Current Password" required>
                <div className="password-input-wrap">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label="Toggle password visibility"
                  >
                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              <FormField label="New Password" required>
                <div className="password-input-wrap">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 8 characters)"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNew(!showNew)}
                    aria-label="Toggle password visibility"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="password-strength-container">
                    <div className="strength-bar-track">
                      <div
                        className="strength-bar-fill"
                        style={{
                          width: `${(strength / 4) * 100}%`,
                          backgroundColor: strengthColors[Math.max(0, strength - 1)] || "var(--danger)",
                        }}
                      />
                    </div>
                    <span className="strength-label">
                      Strength: <strong>{strengthLabels[Math.max(0, strength - 1)] || "Weak"}</strong>
                    </span>
                  </div>
                )}
              </FormField>

              <FormField label="Confirm New Password" required>
                <div className="password-input-wrap">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {/* Password Requirements Checklist */}
              <div className="password-rules-box">
                <span className="rules-heading">Password requirements:</span>
                <ul className="rules-list">
                  <li className={hasMinLength ? "rule-met" : "rule-unmet"}>
                    {hasMinLength ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    At least 8 characters
                  </li>
                  <li className={hasLetter ? "rule-met" : "rule-unmet"}>
                    {hasLetter ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Contains at least one letter
                  </li>
                  <li className={hasNumber ? "rule-met" : "rule-unmet"}>
                    {hasNumber ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Contains at least one number
                  </li>
                  <li className={passwordsMatch ? "rule-met" : "rule-unmet"}>
                    {passwordsMatch ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Passwords match
                  </li>
                </ul>
              </div>

              <div className="form-submit-row">
                <Button
                  type="submit"
                  variant="primary"
                  loading={pwSaving}
                  disabled={pwSaving || !hasMinLength || !hasLetter || !hasNumber || !passwordsMatch || !currentPassword}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
