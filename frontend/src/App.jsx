import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import LoginPage   from './pages/LoginPage';
import HomePage    from './pages/HomePage';
import EntryPage   from './pages/EntryPage';
import IssuePage   from './pages/IssuePage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Routes>
          <Route path="/"        element={<LoginPage />} />
          <Route path="/home"    element={<HomePage />} />
          <Route path="/entry"   element={<EntryPage />} />
          <Route path="/issue"   element={<IssuePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </StoreProvider>
    </BrowserRouter>
  );
}
