import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ArticleDetail from './pages/ArticleDetail';
import WriteArticle from './pages/WriteArticle';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

// Maps the demo role selector to a user id until real authentication
// (User Management module) is wired in. Notification components accept
// a userId prop, so swapping this for the authenticated user's id later
// only requires changing how `userId` is derived here.
const ROLE_USER_IDS = {
  'Priya Mehta (author)': 1,
  'Thomas Okeke (author)': 2,
  'Amara Silva (admin)': 3,
  'Lena Kaufmann (reader)': 4,
};

export default function App() {
  const [role, setRole] = useState('Priya Mehta (author)');
  const userId = ROLE_USER_IDS[role] || 1;

  return (
    <Router>
      <Navbar currentRole={role} setRole={setRole} userId={userId} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/write" element={<WriteArticle />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications userId={userId} />} />
      </Routes>
    </Router>
  );
}