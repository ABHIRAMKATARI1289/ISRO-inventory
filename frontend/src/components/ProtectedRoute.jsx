import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards a route behind authentication + optional level check.
 * minLevel: minimum level required (default 1 = just logged in)
 */
export default function ProtectedRoute({ children, minLevel = 1 }) {
  const { user, level } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (level < minLevel) {
    // User is logged in but insufficient level — send to home with state
    return <Navigate to="/home" replace state={{ accessDenied: true, requiredLevel: minLevel }} />;
  }

  return children;
}
