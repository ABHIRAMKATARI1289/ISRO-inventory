import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfile, setShowProfile] = useState(false);

  const links = [
    { label: 'Entry',   path: '/entry' },
    { label: 'Issue',   path: '/issue' },
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
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Date/Time */}
        <div className="hidden sm:block text-xs text-white/30" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>

        {/* Profile */}
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
          <span className="text-xs text-white/70">My Profile</span>
        </button>
      </nav>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
