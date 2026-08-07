import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
          <p className="text-sm text-ink-muted">one sec...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
