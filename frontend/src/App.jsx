import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage   from './pages/LoginPage';
import HomePage    from './pages/HomePage';
import EntryPage   from './pages/EntryPage';
import IssuePage   from './pages/IssuePage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <Routes>
            <Route path="/"        element={<LoginPage />} />
            <Route path="/home"    element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/entry"   element={<ProtectedRoute minLevel={2}><EntryPage /></ProtectedRoute>} />
            <Route path="/issue"   element={<ProtectedRoute minLevel={2}><IssuePage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="*"        element={<Navigate to="/" replace />} />
          </Routes>
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
