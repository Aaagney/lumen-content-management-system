import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutGrid, 
  Search, 
  PenTool, 
  CreditCard, 
  User, 
  Bell, 
  ChevronDown 
} from 'lucide-react';

export default function Navbar({ currentRole = 'Priya Mehta (author)', setRole }) {
  const getInitials = (roleStr) => {
    if (roleStr.includes('Priya')) return 'PM';
    if (roleStr.includes('Thomas')) return 'TO';
    if (roleStr.includes('Amara')) return 'AS';
    if (roleStr.includes('Lena')) return 'LK';
    return 'AU';
  };

  return (
    <nav className="navbar">
      {/* Brand Logo matching Lumen CMS screenshot */}
      <NavLink to="/" className="logo">
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'var(--brand-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <BookOpen size={18} />
        </div>
        <span>Lumen</span>
      </NavLink>

      {/* Main Navigation Links */}
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <LayoutGrid size={16} /> Home
        </NavLink>
        <NavLink to="/browse" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Search size={16} /> Browse
        </NavLink>
        <NavLink to="/write" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <PenTool size={16} /> Write
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <CreditCard size={16} /> Subscriptions
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <User size={16} /> Profile
        </NavLink>
      </div>

      {/* Right User Bar: Role Switcher Pill + Bell + Avatar Initials */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select 
            className="select-field" 
            value={currentRole} 
            onChange={(e) => setRole(e.target.value)}
            style={{ 
              margin: 0, 
              padding: '6px 30px 6px 14px', 
              fontSize: '13px', 
              fontWeight: '600',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              color: 'var(--text-primary)',
              appearance: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            <option value="Priya Mehta (author)">Priya Mehta (author)</option>
            <option value="Thomas Okeke (author)">Thomas Okeke (author)</option>
            <option value="Amara Silva (admin)">Amara Silva (admin)</option>
            <option value="Lena Kaufmann (reader)">Lena Kaufmann (reader)</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: '#666' }} />
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }} title="Notifications">
          <Bell size={19} />
          <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent-gold)' }}></span>
        </div>

        {/* User Initials Avatar Circle */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--brand-green)',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          letterSpacing: '0.05em'
        }} title={currentRole}>
          {getInitials(currentRole)}
        </div>
      </div>
    </nav>
  );
}