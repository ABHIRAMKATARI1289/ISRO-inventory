import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useStore } from '../context/StoreContext';


/* ── Animated Count-Up ─────────────────────────────────────────────────── */
function CountUp({ target, duration = 1800, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref} className="mono">{count.toLocaleString()}{suffix}</span>;
}

/* ── Scroll Reveal Hook ────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ── Orbital SVG Background ────────────────────────────────────────────── */
function OrbitalBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="dot-grid absolute inset-0 opacity-40" />
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
        width="800" height="800" viewBox="0 0 800 800"
        style={{ animation: 'orbitSpin 40s linear infinite' }}
      >
        <circle cx="400" cy="400" r="180" stroke="#F59E0B" strokeWidth="0.8" fill="none" strokeDasharray="8 12"/>
        <circle cx="400" cy="400" r="280" stroke="#F59E0B" strokeWidth="0.5" fill="none" strokeDasharray="4 20"/>
        <circle cx="400" cy="400" r="360" stroke="#F59E0B" strokeWidth="0.4" fill="none" strokeDasharray="2 30"/>
        <circle cx="400" cy="220" r="6" fill="#F59E0B" opacity="0.7"/>
        <circle cx="580" cy="340" r="4" fill="#FBBF24" opacity="0.5"/>
        <circle cx="290" cy="520" r="5" fill="#F59E0B" opacity="0.6"/>
      </svg>
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }}
      />
    </div>
  );
}

/* ── Low Stock Alert Panel ─────────────────────────────────────────────── */
function LowStockPanel({ navigate }) {
  const { lowStockItems, loading } = useStore();
  const [expanded, setExpanded] = useState(true);

  if (loading) return null;

  const critical = lowStockItems.filter(i => Number(i.currentStock) === 0);
  const low      = lowStockItems.filter(i => Number(i.currentStock) > 0);

  if (lowStockItems.length === 0) {
    return (
      <div
        className="w-full max-w-xl mb-10 flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{
          background: 'rgba(16,185,129,0.06)',
          borderColor: 'rgba(16,185,129,0.2)',
          animation: 'fadeUp 0.8s 0.55s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <span className="text-emerald-400 text-lg">✓</span>
        <span className="text-emerald-400 text-sm mono">All items above threshold — inventory healthy</span>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-2xl mb-10"
      style={{ animation: 'fadeUp 0.8s 0.55s cubic-bezier(0.16,1,0.3,1) both' }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-t-xl border border-red-500/30 transition-all"
        style={{ background: 'rgba(239,68,68,0.1)', borderBottomColor: expanded ? 'transparent' : 'rgba(239,68,68,0.3)' }}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 font-semibold text-sm mono tracking-wide">
            LOW STOCK ALERTS
          </span>
          <span className="px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-xs mono font-bold">
            {lowStockItems.length}
          </span>
          {critical.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600/30 border border-red-600/40 text-red-300 text-xs mono font-bold animate-pulse">
              {critical.length} OUT OF STOCK
            </span>
          )}
        </div>
        <span className="text-red-400/60 text-xs mono">
          {expanded ? '▲ collapse' : '▼ expand'}
        </span>
      </button>

      {/* Alert rows */}
      {expanded && (
        <div className="border border-t-0 border-red-500/20 rounded-b-xl overflow-hidden"
          style={{ background: 'rgba(239,68,68,0.04)' }}>
          {lowStockItems.map((item, i) => {
            const isOut     = Number(item.currentStock) === 0;
            const threshold = Number(item.threshold || 5);
            const stock     = Number(item.currentStock);
            const pct       = Math.min(100, Math.round((stock / threshold) * 100));

            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-4 py-3 ${i < lowStockItems.length - 1 ? 'border-b border-red-500/10' : ''}`}
              >
                {/* Status dot */}
                <div className={`flex-shrink-0 w-2 h-2 rounded-full ${isOut ? 'bg-red-600 animate-pulse' : 'bg-amber-500'}`} />

                {/* Name + category */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/90 text-sm font-medium truncate">{item.name}</span>
                    <span className="text-white/30 text-xs mono flex-shrink-0">{item.categoryName}</span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 rounded-full bg-white/5 w-32 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOut ? 'bg-red-600' : 'bg-amber-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Stock / Threshold */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-bold mono ${isOut ? 'text-red-400' : 'text-amber-400'}`}>
                    {isOut ? 'OUT' : stock}
                    <span className="text-white/20 font-normal"> / {threshold}</span>
                  </div>
                  <div className="text-white/25 text-xs mono">
                    {isOut ? 'reorder now' : `−${item.deficit} below min`}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate('/entry')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isOut
                      ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                  }`}
                >
                  Restock →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { totalItems, entriesToday, issuesToday, lowStockItems, loading } = useStore();
  useScrollReveal();

  const stats = [
    { label: 'Total Items',     value: loading ? 0 : totalItems,    suffix: '',  color: 'text-amber-400' },
    { label: 'Entries Today',   value: loading ? 0 : entriesToday,  suffix: '',  color: 'text-emerald-400' },
    { label: 'Issues Today',    value: loading ? 0 : issuesToday,   suffix: '',  color: 'text-sky-400' },
  ];

  const modules = [
    {
      id: 'entry',
      direction: 'from-left',
      icon: '📥',
      headline: 'Material Entry',
      description: 'Log incoming materials with precision. Track every item from receipt to shelf — with automatic stock computation and audit-ready records.',
      bullets: ['Category Management', 'Auto Stock Calculation', 'Full Entry Logs'],
      cta: 'Go to Entry →',
      path: '/entry',
      color: 'text-amber-400',
      accent: 'rgba(245,158,11,',
    },
    {
      id: 'issue',
      direction: 'from-right',
      icon: '📤',
      headline: 'Material Issue',
      description: 'Issue materials to personnel with full approval chain. System-computed closing quantities ensure zero manual errors.',
      bullets: ['Officer Approval Tracking', 'Real-time Stock Deduction', 'Issuance History'],
      cta: 'Go to Issue →',
      path: '/issue',
      color: 'text-sky-400',
      accent: 'rgba(56,189,248,',
    },
    {
      id: 'reports',
      direction: 'from-scale',
      icon: '📊',
      headline: 'Reports & Intelligence',
      description: 'Live dashboards, stock health indicators, and AI-generated executive insights — all in one place.',
      bullets: ['Visual Stock Charts', 'AI Insight Reports', 'CSV Export'],
      cta: 'Go to Reports →',
      path: '/reports',
      color: 'text-violet-400',
      accent: 'rgba(139,92,246,',
    },
  ];

  return (
    <div id="home-page" className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <Toast />

      {/* ═══ SECTION 1: HERO ════════════════════════════════════════════ */}
      <section id="home-hero" className="snap-section pt-14" style={{ minHeight: '100vh' }}>
        <OrbitalBg />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 py-20" style={{ minHeight: '100vh' }}>
          
          <div className="mb-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 inline-flex items-center gap-2"
            style={{ animation: 'fadeDown 0.6s ease both' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400/80 text-xs tracking-widest mono">ISRO · URSC BANGALORE · STORE DBMS v1.0</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-5 leading-tight heading"
            style={{ animation: 'fadeUp 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            <span className="accent-text">Precision Inventory.</span>
            <br />
            <span className="text-white/90">Mission Ready.</span>
          </h1>

          <p
            className="text-white/50 text-lg mb-12 max-w-xl"
            style={{ animation: 'fadeUp 0.8s 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            URSC Bangalore — Store Management System
          </p>

          {/* Stat Cards */}
          <div
            className="grid grid-cols-3 gap-4 mb-8 w-full max-w-xl"
            style={{ animation: 'fadeUp 0.8s 0.4s cubic-bezier(0.16,1,0.3,1) both' }}
          >
            {stats.map(({ label, value, suffix, color }) => (
              <div key={label} className="glass-card p-5 text-center card-hover"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className={`text-3xl font-bold ${color} stat-number`}>
                  <CountUp target={value} suffix={suffix} />
                </div>
                <div className="text-white/40 text-xs mt-1 mono tracking-wide">{label}</div>
              </div>
            ))}
          </div>

          {/* Low Stock Alerts Panel */}
          <LowStockPanel navigate={navigate} />

          {/* Scroll Caret */}
          <div className="caret-pulse flex flex-col items-center gap-2 text-white/30">
            <span className="text-xs mono tracking-widest">SCROLL TO EXPLORE</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ SECTIONS 2–4: MODULES ══════════════════════════════════════ */}
      {modules.map((mod, i) => (
        <section
          key={mod.id}
          id={`home-${mod.id}-section`}
          className={`snap-section blueprint-grid`}
          style={{ background: i % 2 === 0 ? 'rgba(17,24,39,0.6)' : 'transparent' }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: `radial-gradient(circle, ${mod.accent}0.06) 0%, transparent 70%)` }}
            />
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20">
            <div className={`flex flex-col ${i === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
              
              {/* Text Block */}
              <div className={`flex-1 scroll-reveal ${mod.direction}`}>
                <div className="text-5xl mb-4">{mod.icon}</div>
                <h2 className={`text-4xl md:text-5xl font-bold mb-5 heading ${mod.color}`}>
                  {mod.headline}
                </h2>
                <p className="text-white/50 text-lg mb-7 leading-relaxed" style={{ maxWidth: 480 }}>
                  {mod.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {mod.bullets.map(b => (
                    <li key={b} className="flex items-center gap-3 text-white/70 text-sm">
                      <span className={`w-1.5 h-1.5 rounded-full ${mod.color.replace('text-', 'bg-')}`} />
                      {b}
                    </li>
                  ))}
                </ul>
                <button
                  id={`home-cta-${mod.id}`}
                  onClick={() => navigate(mod.path)}
                  className="glow-btn px-8 py-3 rounded-xl font-semibold text-sm text-black"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}
                >
                  {mod.cta}
                </button>
              </div>

              {/* Visual Card */}
              <div className={`flex-1 scroll-reveal ${i === 1 ? 'from-left' : 'from-right'}`}>
                <div className="glass-card-dark p-6 max-w-sm mx-auto"
                  style={{ border: `1px solid ${mod.accent}0.2)` }}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="flex-1 h-px bg-white/10 ml-2" />
                    <span className="text-white/20 text-xs mono">URSC-STORE</span>
                  </div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="flex gap-2 items-center">
                        <div className={`h-1.5 rounded-full ${j === 1 ? `${mod.color.replace('text-', 'bg-')} opacity-80` : 'bg-white/10'}`}
                          style={{ width: `${[70, 90, 55, 80, 65][j]}%` }} />
                        <div className="h-1.5 rounded-full bg-white/5" style={{ width: `${[30, 10, 45, 20, 35][j]}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-white/20 text-xs mono">live data</span>
                    <div className="flex gap-1">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className={`w-5 h-5 rounded ${mod.color.replace('text-', 'bg-')} opacity-${[20, 40, 60][j]}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ═══ SECTION 5: FOOTER ══════════════════════════════════════════ */}
      <footer id="home-footer" className="py-12 text-center border-t" style={{ borderColor: 'var(--border)', background: 'rgba(17,24,39,0.5)' }}>
        <div className="flex justify-center mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L9 7H5l3 3-1.5 5L12 12l5.5 3L16 10l3-3h-4L12 2z" fill="#F59E0B" opacity="0.9"/>
              <circle cx="12" cy="12" r="2.5" fill="#FBBF24"/>
            </svg>
          </div>
        </div>
        <p className="text-white/40 text-sm mb-1">URSC Bangalore · Department of Space · Government of India</p>
        <p className="text-white/20 text-xs mono">Store DBMS v1.0 — Internal Use Only</p>
      </footer>
    </div>
  );
}
