import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Menu</div>
      <NavLink 
        to="/" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        end
      >
        📊 Dashboard
      </NavLink>
      <NavLink 
        to="/content" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
      >
        📄 All Content
      </NavLink>
      <NavLink 
        to="/content/add" 
        className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
      >
        ➕ Add Content
      </NavLink>
    </aside>
  );
};

export default Sidebar;