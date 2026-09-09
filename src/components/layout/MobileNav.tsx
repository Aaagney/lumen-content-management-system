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
  X,
} from 'lucide-react';

interface MobileNavProps {
  open?: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/pending', label: 'Pending', icon: Clock },
  { to: '/published', label: 'Published', icon: CheckCircle },
  { to: '/reviews', label: 'Reviews', icon: ClipboardList },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav({}: MobileNavProps) {
  return (
    <div className="md:hidden">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <ShieldCheck size={18} />
        </div>
        <span className="font-bold text-slate-900">Admin CMS</span>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
