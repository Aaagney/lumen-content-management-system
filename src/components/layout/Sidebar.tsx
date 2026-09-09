import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  ClipboardList,
  FolderTree,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/pending', label: 'Pending', icon: Clock },
  { to: '/published', label: 'Published', icon: CheckCircle },
  { to: '/reviews', label: 'Reviews', icon: ClipboardList },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">Admin CMS</p>
          <p className="text-xs text-slate-500">Content Management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            AD
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">Admin User</p>
            <p className="truncate text-xs text-slate-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
