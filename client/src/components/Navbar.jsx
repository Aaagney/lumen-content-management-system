import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="top-navbar">
      <Link to="/" className="brand-logo" title="Home">
        📖
      </Link>
      
      <div className="nav-right">
        <button className="icon-button" title="Notifications">
          🔔
          <span className="notification-dot"></span>
        </button>

        <div className="avatar-circle" title="Loga Shree S (PM)">
          PM
        </div>

        <button className="icon-button" title="Menu">
          ☰
        </button>
      </div>
    </header>
  );
};

export default Navbar;