import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { MobileNav } from './MobileNav';

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your content platform' },
  '/content': { title: 'Content Management', subtitle: 'Manage all content items' },
  '/content/new': { title: 'Create Content', subtitle: 'Add a new content item' },
  '/pending': { title: 'Pending Content', subtitle: 'Content awaiting admin approval' },
  '/published': { title: 'Published Content', subtitle: 'All published content' },
  '/reviews': { title: 'Reviews', subtitle: 'All content review activity' },
  '/categories': { title: 'Categories', subtitle: 'Manage content categories' },
  '/settings': { title: 'Settings', subtitle: 'Admin configuration' },
};

export default function AdminLayout() {
  const location = useLocation();
  const path = location.pathname;

  let meta = pageMeta[path];
  if (!meta) {
    if (path.startsWith('/content/') && path.endsWith('/edit')) {
      meta = { title: 'Edit Content', subtitle: 'Modify an existing content item' };
    } else if (path.startsWith('/content/')) {
      meta = { title: 'View Content', subtitle: 'Content details' };
    } else {
      meta = { title: 'Admin', subtitle: 'Content Management System' };
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <MobileNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
