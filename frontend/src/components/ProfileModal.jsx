import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ onClose }) {
  const { user, levelLabel, levelColor } = useAuth();
  const colors = levelColor();

  const name       = user?.name       || 'Unknown';
  const employeeId = user?.employeeId || '—';
  const level      = user?.level      || 1;

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        id="profile-modal"
        className="glass-card-dark w-full max-w-md mx-4 p-0 overflow-hidden"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.03))' }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5">
              <img src="/isro-logo.svg" alt="ISRO" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{name}</div>
              <div className="text-amber-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                {employeeId}
              </div>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4">
          {[
            ['EMPLOYEE ID',   employeeId],
            ['FULL NAME',     name],
            ['ACCESS LEVEL',  levelLabel()],
            ['ORGANISATION',  'URSC Bangalore · ISRO'],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="field-label">{label}</div>
              <div className="text-white/90 text-sm mono">{value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <div className="flex-1 text-center py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs text-emerald-400/70 mono">STATUS</div>
            <div className="text-sm text-emerald-400 font-semibold">Active</div>
          </div>
          <div className={`flex-1 text-center py-2 rounded-lg border ${colors.bg} ${colors.border}`}>
            <div className={`text-xs mono opacity-70 ${colors.text}`}>CLEARANCE</div>
            <div className={`text-sm font-semibold ${colors.text}`}>Level {level}</div>
          </div>
          <div className="flex-1 text-center py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-white/40 mono">ACCESS</div>
            <div className="text-sm text-white/80 font-semibold">
              {level >= 3 ? 'Admin' : level >= 2 ? 'Operator' : 'Viewer'}
            </div>
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="text-center text-xs text-white/20 mono">
            URSC Bangalore · Department of Space · GoI
          </div>
        </div>
      </div>
    </div>
  );
}
