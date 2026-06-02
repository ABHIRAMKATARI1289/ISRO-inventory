import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileModal from './ProfileModal';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, canEdit, isAdmin, levelLabel, levelColor } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const colors = levelColor();

  // ── Fetch pending issue requests count (Level 3 only) ─────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    const fetchPending = async () => {
      try {
        const { data } = await axios.get('/api/issue-requests');
        setPendingCount(data.filter(r => r.status === 'pending').length);
      } catch {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Build nav links based on level
  const links = [
    ...(canEdit ? [{ label: 'Entry', path: '/entry' }] : []),
    ...(canEdit ? [{ label: 'Issue', path: '/issue' }] : []),
    { label: 'Reports', path: '/reports' },
  ];

  return (
    <>
      <nav className="navbar">
        {/* Logo */}
        <button
          id="nav-logo-btn"
          onClick={() => navigate('/home')}
          className="flex items-center gap-2.5 group flex-shrink-0"
        >
          <img
            src="/isro-logo.svg"
            alt="ISRO Logo"
            className="h-9 w-auto object-contain group-hover:opacity-80 transition-opacity duration-200"
            style={{ filter: 'drop-shadow(0 0 6px rgba(244,121,32,0.3))' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 flex-shrink-0" />

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {links.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                id={`nav-${label.toLowerCase()}-btn`}
                onClick={() => navigate(path)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            );
          })}

          {/* Level 1 — view-only badge */}
          {!canEdit && (
            <span className="px-3 py-1 rounded-lg text-xs mono text-slate-400 bg-slate-500/10 border border-slate-500/20">
              👁 View Only
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date/Time */}
        <div className="hidden sm:block text-xs text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>

        {/* Pending bell (Level 3 only) */}
        {isAdmin && (
          <button
            id="nav-approvals-btn"
            onClick={() => navigate('/home')}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
            title="Pending Approvals"
          >
            <span className="text-base">🔔</span>
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 border border-red-600 text-white text-[10px] font-bold mono flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        )}

        {/* Level badge */}
        {user && (
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs mono ${colors.text} ${colors.bg} ${colors.border}`}>
            <span className="font-bold">L{user.level}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-80">{user.level === 3 ? 'Admin' : user.level === 2 ? 'Operator' : 'Viewer'}</span>
          </div>
        )}

        {/* Profile + Logout */}
        <button
          id="nav-profile-btn"
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
        >
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" fill="#F59E0B"/>
              <path d="M2 13c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-xs text-white/70 max-w-[90px] truncate">{user?.name || 'Profile'}</span>
        </button>

        {/* Logout */}
        <button
          id="nav-logout-btn"
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
          title="Logout"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
