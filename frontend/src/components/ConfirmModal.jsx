import React, { useEffect } from 'react';

/**
 * ConfirmModal — a danger-styled confirmation dialog.
 * Props:
 *   title       string  — modal heading
 *   message     string  — body text / warning
 *   confirmText string  — confirm button label (default "Delete")
 *   onConfirm   fn      — called when user confirms
 *   onCancel    fn      — called when user cancels / clicks backdrop
 *   loading     bool    — shows spinner on confirm button
 */
export default function ConfirmModal({
  title       = 'Are you sure?',
  message     = 'This action cannot be undone.',
  confirmText = 'Delete',
  onConfirm,
  onCancel,
  loading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="glass-card-dark w-full max-w-sm mx-4 p-6 border border-red-500/20"
        style={{
          animation: 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
          boxShadow: '0 0 60px rgba(239,68,68,0.1)',
        }}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M19 6l-1 14H6L5 6M10 6V4h4v2" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 11v5M14 11v5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            id="confirm-modal-cancel"
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-sm font-medium transition-all disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            id="confirm-modal-delete"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 hover:text-red-300 text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
