import React from 'react';

const EMPLOYEE = {
  name:       'Dr. Suresh Iyer',
  employeeId: 'URSC001',
  department: 'Systems & Avionics',
  designation:'Senior Scientific Officer',
  division:   'Store Management Division',
  joined:     '2019-03-15',
};

export default function ProfileModal({ onClose }) {
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
              <div className="text-lg font-semibold text-white">{EMPLOYEE.name}</div>
              <div className="text-amber-400 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                {EMPLOYEE.employeeId}
              </div>
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4">
          {[
            ['DEPARTMENT',   EMPLOYEE.department],
            ['DESIGNATION',  EMPLOYEE.designation],
            ['DIVISION',     EMPLOYEE.division],
            ['DATE JOINED',  new Date(EMPLOYEE.joined).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="field-label">{label}</div>
              <div className="text-white/90 text-sm mono">{value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <div className="flex-1 text-center py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs text-amber-400/70 mono">STATUS</div>
            <div className="text-sm text-amber-400 font-semibold">Active</div>
          </div>
          <div className="flex-1 text-center py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs text-emerald-400/70 mono">CLEARANCE</div>
            <div className="text-sm text-emerald-400 font-semibold">Level 2</div>
          </div>
          <div className="flex-1 text-center py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-white/40 mono">ACCESS</div>
            <div className="text-sm text-white/80 font-semibold">Full</div>
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
