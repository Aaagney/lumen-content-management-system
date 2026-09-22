import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/articles', label: 'Articles', icon: '📄' },
  { to: '/quizzes', label: 'Quizzes', icon: '❓' },
  { to: '/moderation', label: 'Moderation', icon: '🛡', badge: '38' },
  { to: '/spam-abuse', label: 'Spam & Abuse', icon: '🚫', highlight: true },
  { to: '/reports', label: 'Reports', icon: '📋' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/subscriptions', label: 'Subscriptions', icon: '🎁' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙' }
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">◆</div>
        <div>
          <div className="sidebar-brand-title">CMS Admin</div>
          <div className="sidebar-brand-sub">Content Platform</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-link-left">
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar-circle">A</div>
        <div>
          <div className="sidebar-footer-name">Admin User</div>
          <div className="sidebar-footer-role">Super Admin</div>
        </div>
      </div>
    </aside>
  );
}
