import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import Content from '@/pages/Content';
import ContentCreate from '@/pages/ContentCreate';
import ContentView from '@/pages/ContentView';
import ContentEdit from '@/pages/ContentEdit';
import Pending from '@/pages/Pending';
import Published from '@/pages/Published';
import Categories from '@/pages/Categories';
import Reviews from '@/pages/Reviews';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/content" element={<Content />} />
          <Route path="/content/new" element={<ContentCreate />} />
          <Route path="/content/:id" element={<ContentView />} />
          <Route path="/content/:id/edit" element={<ContentEdit />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/published" element={<Published />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
