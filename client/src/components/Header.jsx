import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { currentUser, setCurrentUser, initials, isReader, USERS } = useUser();
  const location = useLocation();

  const isBrowseActive = location.pathname === '/' || location.pathname === '/browse' || location.pathname.startsWith('/article');

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          <svg viewBox="0 0 24 24">
            <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1 0.9 2 2 2h18c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2zM3 6h8v12H3V6zm18 12h-8V6h8v12z" />
            <path d="M5 8h4v2H5V8zm0 4h4v2H5v-2zm10-4h4v2h-4V8zm0 4h4v2h-4v-2z" />
          </svg>
          <span>Lumen</span>
        </Link>

        {/* Center Links */}
        <nav className="nav-links">
          <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </a>
          <Link to="/" className={`nav-item ${isBrowseActive ? 'active' : ''}`}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse
          </Link>
          {!isReader && (
            <a href="#" id="writeLink" className="nav-item" onClick={(e) => e.preventDefault()}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Write
            </a>
          )}
          <a href="#" className="nav-item" onClick={(e) => e.preventDefault()}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </a>
        </nav>

        {/* Right Actions */}
        <div className="header-right">
          {/* User Simulator Dropdown */}
          <select
            id="userDropdown"
            className="user-selector"
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
          >
            {USERS.map((user) => (
              <option key={user.name} value={user.name}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>

          {/* Notification Bell */}
          <button className="bell-btn" aria-label="Notifications" type="button">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="bell-dot"></span>
          </button>

          {/* User Avatar Circle */}
          <div id="userAvatar" className="user-avatar">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
