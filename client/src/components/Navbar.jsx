import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Bell, ChevronDown, Search, LayoutGrid, Edit3, User, LogOut, CheckSquare } from "lucide-react";
import { api } from "../services/api";

function Navbar({ currentUser, onUserSwitch, onLogout }) {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch users for switcher on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await api.getUsers();
        setAvailableUsers(users);
      } catch (err) {
        console.error("Failed to load users for switcher:", err);
      }
    };
    fetchUsers();
  }, [currentUser]); // reload users if role/user updates

  const handleSelectUser = async (user) => {
    setDropdownOpen(false);
    try {
      // Authenticate as this user
      await onUserSwitch(user.email);
    } catch (err) {
      console.error("Error switching user:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="lumen-header">
      {/* Brand Logo */}
      <Link to="/" className="logo-container">
        <span className="logo-icon">
          <BookOpen size={18} strokeWidth={2.5} />
        </span>
        <span>Lumen</span>
      </Link>

      {/* Nav Menu Links */}
      <nav className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          <LayoutGrid size={16} />
          <span>Home</span>
        </Link>
        <Link to="/browse" className={`nav-link ${location.pathname === "/browse" ? "active" : ""}`}>
          <Search size={16} />
          <span>Browse</span>
        </Link>
        
        {/* Only show 'Write' link for Author role */}
        {currentUser && currentUser.role === "author" && (
          <Link to="/write" className={`nav-link ${location.pathname === "/write" ? "active" : ""}`}>
            <Edit3 size={16} />
            <span>Write</span>
          </Link>
        )}

        {/* Only show 'Admin' link for Admin role */}
        {currentUser && currentUser.role === "admin" && (
          <Link to="/admin" className={`nav-link ${location.pathname === "/admin" ? "active" : ""}`}>
            <CheckSquare size={16} />
            <span>Admin</span>
          </Link>
        )}
        
        {currentUser && (
          <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
            <User size={16} />
            <span>Profile</span>
          </Link>
        )}
      </nav>

      {/* Right-aligned Navigation Controls */}
      <div className="nav-right">
        {currentUser ? (
          <>
            {/* Nav Role-Switcher Dropdown */}
            <div className="role-dropdown-container">
              <button 
                className="role-select-trigger" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span>{`${currentUser.fullname} (${currentUser.role})`}</span>
                <ChevronDown size={14} />
              </button>

              {dropdownOpen && (
                <div className="role-dropdown-menu">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`role-dropdown-item ${currentUser.id === user.id ? "active" : ""}`}
                      onClick={() => handleSelectUser(user)}
                    >
                      {`${user.fullname} (${user.role})`}
                    </div>
                  ))}
                  <div 
                    className="role-dropdown-item" 
                    onClick={() => { setDropdownOpen(false); onLogout(); }}
                    style={{ borderTop: "1px solid #c9c4b7", display: "flex", alignItems: "center", gap: "6px", color: "#991b1b" }}
                  >
                    <LogOut size={12} />
                    <span>Log Out</span>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button className="notification-btn">
              <Bell size={18} />
              <span className="notification-badge"></span>
            </button>

            {/* Initials Avatar Circle */}
            <div className="avatar-circle">
              {getInitials(currentUser.fullname)}
            </div>
          </>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <Link to="/login" className="nav-link" style={{ fontWeight: 600 }}>Log In</Link>
            <Link to="/register" className="nav-link active" style={{ fontWeight: 600 }}>Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
