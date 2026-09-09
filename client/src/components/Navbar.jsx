import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navClass = ({ isActive }) =>
    isActive ? 'nav-item active' : 'nav-item';

  return (
    <nav className="navbar">

      {/* Logo */}
      <NavLink to="/" className="logo">
        <BookOpen size={24} /> Lucent
      </NavLink>

      {/* Main Navigation */}
      <div className="nav-links">

        <NavLink to="/" className={navClass}>
          Home
        </NavLink>

        <NavLink to="/browse" className={navClass}>
          Browse
        </NavLink>

        {/* Personal Chat */}
        {user && (
          <NavLink to="/chat" className={navClass}>
            Personal Chat
          </NavLink>
        )}

        {/* Write */}
        {user && (user.role === 'author' || user.role === 'admin') && (
          <NavLink to="/write" className={navClass}>
            Write
          </NavLink>
        )}

        {/* Author Options */}
        {user && user.role === 'author' && (
          <>
            <NavLink to="/author/quizzes" className={navClass}>
              Quizzes
            </NavLink>

            <NavLink to="/author/subscription" className={navClass}>
              Subscription
            </NavLink>
          </>
        )}

        {/* Profile */}
        {user && (
          <NavLink to="/profile" className={navClass}>
            Profile
          </NavLink>
        )}

        {/* Admin Options */}
        {user && user.role === 'admin' && (
          <>
            <NavLink to="/admin/content" className={navClass}>
              Content
            </NavLink>

            <NavLink to="/admin" className={navClass}>
              Admin Verification
            </NavLink>
          </>
        )}

      </div>

      {/* Right Side */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >

        {user ? (
          <>
            {/* Notifications */}
            <NotificationBell />

            <NavLink to="/notifications" className="nav-item">
              Notifications
            </NavLink>

            {/* User Name & Role */}
            <span
              style={{
                fontSize: '14px',
                color: '#444'
              }}
            >
              {user.fullname}{' '}

              <span
                style={{
                  color: '#999',
                  textTransform: 'capitalize'
                }}
              >
                ({user.role})
              </span>
            </span>

            {/* Logout */}
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-secondary">
              Login
            </NavLink>

            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        )}

      </div>

    </nav>
  );
}