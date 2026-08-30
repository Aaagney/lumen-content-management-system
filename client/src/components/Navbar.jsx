import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar({ currentRole, setRole, userId }) {
  return (
    <nav className="navbar">
      <NavLink to="/" className="logo">
        <BookOpen size={24} /> Lucent
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Home</NavLink>
        <NavLink to="/browse" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Browse</NavLink>
        <NavLink to="/write" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Write</NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>Profile</NavLink>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <NotificationBell userId={userId} />
        <span style={{ fontSize: '13px', color: '#666' }}>Demo Role:</span>
        <select 
          className="select-field" 
          value={currentRole} 
          onChange={(e) => setRole(e.target.value)}
          style={{ margin: 0, padding: '4px 8px' }}
        >
          <option value="Priya Mehta (author)">Priya Mehta (author)</option>
          <option value="Thomas Okeke (author)">Thomas Okeke (author)</option>
          <option value="Amara Silva (admin)">Amara Silva (admin)</option>
          <option value="Lena Kaufmann (reader)">Lena Kaufmann (reader)</option>
        </select>
      </div>
    </nav>
  );
}