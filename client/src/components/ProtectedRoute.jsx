import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Frontend-only convenience gate. The backend (authenticateToken /
// requireAdmin) remains the real authorization boundary — this just avoids
// showing a page that would immediately fail its API calls.
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="container">
        <p style={{ color: 'crimson' }}>You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
