import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ReputationDashboard from './pages/ReputationDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ReputationDashboard />} />
        <Route path="/admin" element={<ReputationDashboard />} />
        <Route path="/admin/reputation" element={<ReputationDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
