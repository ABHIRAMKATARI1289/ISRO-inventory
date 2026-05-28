import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEMO_ID  = 'URSC001';
const DEMO_PWD = 'isro@123';

export default function LoginPage() {
  const navigate = useNavigate();
  const [userId,   setUserId]   = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (userId.trim() === DEMO_ID && password === DEMO_PWD) {
        navigate('/home');
      } else {
        setError('Invalid credentials. Use URSC001 / isro@123');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div id="login-page" className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

      {/* ── Video Background ─────────────────────────────────────── */}
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: 'brightness(0.7) saturate(1.1)' }}
      >
        <source src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4" type="video/mp4" />
      </video>

      {/* ── Dark Overlay ─────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10" style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(10,14,26,0.7) 50%, rgba(0,0,0,0.8) 100%)'
      }} />

      {/* ── Ambient Glow ─────────────────────────────────────────── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full z-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)' }}
      />

      {/* ── Frosted Glass Card ──────────────────────────────────── */}
      <div
        id="login-card"
        className="relative z-20 w-full max-w-md mx-4"
        style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <div className="glass-card p-8 md:p-10">

          {/* Logo + Badge */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2"
              style={{ boxShadow: '0 0 40px rgba(244,121,32,0.15)' }}>
              <img src="/isro-logo.svg" alt="ISRO Logo" className="w-full h-full object-contain" />
            </div>

            <h1 className="text-2xl font-bold text-center mb-1 heading" style={{
              background: 'linear-gradient(135deg, #fff 60%, #F59E0B)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              URSC Store Management System
            </h1>
            <p className="text-xs text-white/40 text-center tracking-widest uppercase mono mt-1">
              Department of Space · Government of India
            </p>

            <div className="mt-3 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 text-[10px] tracking-widest mono">ISRO · U R RAO SATELLITE CENTRE · BANGALORE</span>
            </div>
          </div>

          {/* Form */}
          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="field-label">Employee ID</label>
              <input
                id="login-userid"
                type="text"
                className="field-input"
                placeholder="e.g. URSC001"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  className="field-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div id="login-error" className="text-red-400 text-xs mono text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2 px-3">
                ⚠ {error}
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-black glow-btn transition-all duration-200 disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Access System →'}
            </button>
          </form>

          {/* Footer hint */}
          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <p className="text-white/20 text-[10px] mono tracking-widest">
              STORE DBMS v1.0 · INTERNAL USE ONLY
            </p>
          </div>
        </div>
      </div>

      {/* Bottom-left watermark */}
      <div className="absolute bottom-6 left-6 z-20 text-white/20 text-xs mono">
        URSC Bangalore · {new Date().getFullYear()}
      </div>
    </div>
  );
}
