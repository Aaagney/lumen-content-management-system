import React from 'react';
import { BookOpen, LayoutGrid, Search, CheckSquare, User, Bell, ChevronDown } from 'lucide-react';

export default function Navbar({ onResetDb, isResetting }) {
  return (
    <header className="navbar">
      <div className="nav-left">
        <a href="#admin" className="brand-logo">
          <div className="brand-icon">
            <BookOpen size={18} strokeWidth={2.5} />
          </div>
          <span className="brand-name">Lumen</span>
        </a>

        <nav className="nav-links">
          <button type="button" className="nav-item">
            <LayoutGrid size={16} />
            <span>Home</span>
          </button>
          <button type="button" className="nav-item">
            <Search size={16} />
            <span>Browse</span>
          </button>
          <button type="button" className="nav-item active">
            <CheckSquare size={16} />
            <span>Admin</span>
          </button>
          <button type="button" className="nav-item">
            <User size={16} />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      <div className="nav-right">
        {/* Helper to reset/reseed sample data if desired */}
        {onResetDb && (
          <button 
            type="button" 
            onClick={onResetDb} 
            disabled={isResetting}
            title="Reset to clean initial MySQL seed data"
            style={{ 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              background: 'none', 
              border: '1px dashed var(--border-card)', 
              padding: '4px 10px', 
              borderRadius: '9999px',
              cursor: 'pointer' 
            }}
          >
            {isResetting ? 'Resetting DB...' : 'Reset Seed Data'}
          </button>
        )}

        <div className="user-selector-pill">
          <span>Amara Silva (admin)</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>

        <button type="button" className="bell-btn" title="Notifications">
          <Bell size={18} />
          <span className="bell-dot" />
        </button>

        <div className="avatar-circle">
          AS
        </div>
      </div>
    </header>
  );
}
