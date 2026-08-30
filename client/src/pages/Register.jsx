import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "../services/api";

function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("reader"); // reader, author, or admin

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await api.register(fullname, email, password, role);
      onRegisterSuccess(data.user);
      navigate("/profile");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="lumen-card auth-card">
        <div className="auth-header">
          <h1 className="serif-title auth-title">Create Account</h1>
          <p className="auth-subtitle">Join Lumen to write, read, and test your knowledge</p>
        </div>

        {error && (
          <div className="alert-banner error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="fullname-input">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={16} />
              <input
                id="fullname-input"
                type="text"
                className="form-input"
                placeholder="Lena Kaufmann"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                id="email-input"
                type="email"
                className="form-input"
                placeholder="lena@lumen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role selector (Reader vs Author vs Admin toggle) */}
          <div className="form-group">
            <label className="form-label">I want to join as</label>
            <div className="role-toggle-container">
              <button
                type="button"
                className={`role-toggle-btn ${role === "reader" ? "active" : ""}`}
                onClick={() => setRole("reader")}
              >
                Reader
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${role === "author" ? "active" : ""}`}
                onClick={() => setRole("author")}
              >
                Author
              </button>
              <button
                type="button"
                className={`role-toggle-btn ${role === "admin" ? "active" : ""}`}
                onClick={() => setRole("admin")}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password-input">Confirm Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                id="confirm-password-input"
                type={showConfirmPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="input-icon-right"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-forest" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create account</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/login" className="auth-link">Log In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;