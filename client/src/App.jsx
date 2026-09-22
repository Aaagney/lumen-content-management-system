import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ArticleDetail from './pages/ArticleDetail';
import WriteArticle from './pages/WriteArticle';
import Profile from './pages/Profile';
import MyReports from './pages/MyReports';
import MyAppeals from './pages/MyAppeals';
import AdminReports from './pages/AdminReports';
import AdminAppeals from './pages/AdminAppeals';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [role, setRole] = useState('Priya Mehta (author)');

  return (
    <AuthProvider>
      <Router>
        <Navbar currentRole={role} setRole={setRole} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/write" element={<WriteArticle />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/my-appeals" element={<MyAppeals />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/appeals" element={<AdminAppeals />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}