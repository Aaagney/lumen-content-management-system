import React from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, ShieldAlert, Flag, Scale } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentRole, setRole }) {
  const { currentUser, switchUser, isAdmin } = useAuth();

  const handleRoleChange = (e) => {
    const val = e.target.value;
    if (setRole) setRole(val);
    switchUser(val);
  };

  const selectedValue = currentRole || (currentUser ? `${currentUser.name} (${currentUser.role})` : 'Priya Mehta (author)');

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

        {/* User-facing Report & Appeal Navigation */}
        <NavLink to="/my-reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Flag size={14} /> My Reports
        </NavLink>
        <NavLink to="/my-appeals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Scale size={14} /> My Appeals
        </NavLink>

        {/* Admin Moderation Navigation */}
        {isAdmin && (
          <>
            <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'nav-item nav-item-admin active' : 'nav-item nav-item-admin'} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldAlert size={14} /> Admin Reports
            </NavLink>
            <NavLink to="/admin/appeals" className={({ isActive }) => isActive ? 'nav-item nav-item-admin active' : 'nav-item nav-item-admin'} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Scale size={14} /> Admin Appeals
            </NavLink>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#666' }}>Demo Role:</span>
        <select 
          className="select-field" 
          value={selectedValue} 
          onChange={handleRoleChange}
          style={{ margin: 0, padding: '4px 8px', fontSize: '13px' }}
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