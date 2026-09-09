import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ArticleDetail from './pages/ArticleDetail';
import WriteArticle from './pages/WriteArticle';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminVerification from './pages/AdminVerification';
import AuthorSubscription from './pages/AuthorSubscription';
import Quiz from './pages/Quiz';
import QuizManager from './pages/QuizManager';
import ContentManagement from './pages/ContentManagement';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/write" element={<ProtectedRoute><WriteArticle /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/author/subscription" element={<ProtectedRoute><AuthorSubscription /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminVerification /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute requireAdmin><ContentManagement /></ProtectedRoute>} />
          <Route path="/quiz/:id" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/author/quizzes" element={<ProtectedRoute allowedRoles={['author', 'admin']}><QuizManager /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
