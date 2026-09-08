import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import FloatingWidgets from './components/FloatingWidgets';
import BrowsePage from './pages/BrowsePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import './App.css';

function App() {
  return (
    <div className="app-root">
      <Header />
      <Routes>
        <Route path="/" element={<BrowsePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
        <Route path="/article" element={<ArticleDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FloatingWidgets />
    </div>
  );
}

export default App;
