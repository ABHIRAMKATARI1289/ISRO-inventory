import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';

export default function Toast() {
  const { toast } = useStore();

  if (!toast) return null;

  const colors = {
    success: { bg: 'bg-emerald-500/20 border-emerald-500/40', icon: '✓', text: 'text-emerald-400' },
    error:   { bg: 'bg-red-500/20 border-red-500/40',         icon: '✕', text: 'text-red-400' },
    warning: { bg: 'bg-amber-500/20 border-amber-500/40',     icon: '⚠', text: 'text-amber-400' },
  };

  const c = colors[toast.type] || colors.success;

  return (
    <div
      key={toast.id}
      className={`fixed top-20 right-5 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl border ${c.bg} backdrop-blur-md toast-enter`}
      style={{ minWidth: 280, maxWidth: 400 }}
    >
      <span className={`text-lg font-bold ${c.text}`}>{c.icon}</span>
      <span className="text-sm text-white/90" style={{ fontFamily: 'var(--font-mono)' }}>
        {toast.message}
      </span>
    </div>
  );
}
