import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const STORAGE_KEY = 'ursc_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async (employeeId, password) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { employeeId, password });
      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return data.user;
    } catch (e) {
      const msg = e.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Level helpers ─────────────────────────────────────────────────────────
  const level    = user?.level ?? 0;
  const isViewer  = level >= 1;   // can view
  const canEdit   = level >= 2;   // can do entries + submit issue requests
  const isAdmin   = level >= 3;   // can do everything + approve

  const levelLabel = (lvl) => {
    const l = lvl ?? level;
    if (l >= 3) return 'Level 3 — Admin';
    if (l >= 2) return 'Level 2 — Operator';
    return 'Level 1 — Viewer';
  };

  const levelColor = (lvl) => {
    const l = lvl ?? level;
    if (l >= 3) return { text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
    if (l >= 2) return { text: 'text-sky-400',   bg: 'bg-sky-500/15',   border: 'border-sky-500/30' };
    return            { text: 'text-slate-400',  bg: 'bg-slate-500/15', border: 'border-slate-500/30' };
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, authError, authLoading,
      level, isViewer, canEdit, isAdmin,
      levelLabel, levelColor,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
