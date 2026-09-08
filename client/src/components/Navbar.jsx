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

  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        <BookOpen size={24} /> Lucent
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Home</NavLink>
        <NavLink to="/browse" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Browse</NavLink>

        {user && (user.role === 'author' || user.role === 'admin') && (
          <NavLink to="/write" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Write</NavLink>
        )}

        {user && user.role === 'author' && (
          <NavLink to="/author/subscription" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Subscription</NavLink>
        )}

        {user && (
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Profile</NavLink>
        )}

        {user && user.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Admin Verification</NavLink>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user ? (
          <>
            <NotificationBell />
            <span style={{ fontSize: '14px', color: '#444' }}>
              {user.fullname}{' '}
              <span style={{ color: '#999', textTransform: 'capitalize' }}>
                ({user.role})
              </span>
            </span>
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-secondary">Login</NavLink>
            <NavLink to="/register" className="btn btn-primary">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
