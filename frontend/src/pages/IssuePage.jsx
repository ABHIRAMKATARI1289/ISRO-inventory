import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useStore } from '../context/StoreContext';

function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 6V4h4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Issue Form ──────────────────────────────────────────────────────── */
function IssueForm({ item, category, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date,        setDate]        = useState(today);
  const [requestedBy, setRequestedBy] = useState('');
  const [approvedBy,  setApprovedBy]  = useState('');
  const [qty,         setQty]         = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  const openingQty  = Number(item.currentStock) || 0;
  const qtyIssued   = Number(qty) || 0;
  const closingQty  = openingQty - qtyIssued;
  const overIssue   = qtyIssued > openingQty && qty !== '';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!qty || qtyIssued <= 0) { setError('Quantity must be greater than 0'); return; }
    if (overIssue) { setError('Quantity Issued exceeds available stock. Cannot save.'); return; }
    if (!requestedBy.trim()) { setError('Requested By field is required'); return; }
    if (!approvedBy.trim())  { setError('Approved By field is required'); return; }
    setSaving(true);
    try {
      await onSave({
        itemId: item.id,
        categoryId: category.id,
        requestedBy: requestedBy.trim(),
        approvedBy:  approvedBy.trim(),
        date,
        qtyIssued: qtyIssued,
      });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save issue');
      setSaving(false);
    }
  };

  return (
    <div id="issue-form-card" className="glass-card-dark p-6 max-w-2xl mx-auto page-enter">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
          <span className="text-sky-400 text-sm">📤</span>
        </div>
        <div>
          <h2 className="text-white font-semibold">Material Issue</h2>
          <p className="text-white/40 text-xs mono">{category.name} · {item.name}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Item Name</label>
            <input className="field-input" value={item.name} readOnly />
          </div>
          <div>
            <label className="field-label">Category</label>
            <input className="field-input" value={category.name} readOnly />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Date of Issue</label>
            <input id="issue-date" type="date" className="field-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Requested By</label>
            <input id="issue-requested-by" type="text" className="field-input" value={requestedBy} onChange={e => setRequestedBy(e.target.value)} placeholder="Engineer / Officer name" />
          </div>
        </div>

        <div>
          <label className="field-label">Approved By</label>
          <input id="issue-approved-by" type="text" className="field-input" value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Approving authority name" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="field-label">Opening Quantity</label>
            <input className="field-input text-amber-400" value={openingQty} readOnly />
          </div>
          <div>
            <label className="field-label">Quantity Issued</label>
            <input
              id="issue-qty"
              type="number" min="1"
              className={`field-input font-bold ${overIssue ? 'text-red-400 border-red-500/50' : 'text-sky-400'}`}
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="field-label">Closing Quantity</label>
            <input
              className={`field-input font-bold ${overIssue ? 'text-red-400' : 'text-emerald-400'}`}
              value={qty ? (overIssue ? '⚠ OVER' : closingQty) : '—'}
              readOnly
            />
          </div>
        </div>

        {overIssue && (
          <div className="text-red-400 text-xs mono bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-base">⚠</span>
            <span>Insufficient stock! Available: {openingQty} · Requested: {qtyIssued}</span>
          </div>
        )}

        {error && !overIssue && (
          <div className="text-red-400 text-xs mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">⚠ {error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" id="issue-cancel-btn" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-sm font-medium transition-all">
            Cancel
          </button>
          <button type="submit" id="issue-save-btn" disabled={saving || overIssue}
            className="flex-1 py-3 rounded-xl font-semibold text-sm text-black transition-all disabled:opacity-40 glow-btn"
            style={{ background: overIssue ? '#EF4444' : 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
            {saving ? 'Saving...' : 'Save Issue ✓'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main Issue Page ─────────────────────────────────────────────────── */
export default function IssuePage() {
  const { categories, items, addIssue, deleteItem, showToast, getCategoryById } = useStore();
  const [selectedCat,  setSelectedCat]  = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [catSearch,    setCatSearch]    = useState('');
  const [itemSearch,   setItemSearch]   = useState('');
  const [confirmItem,  setConfirmItem]  = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  const filteredCats = useMemo(() =>
    categories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase())),
    [categories, catSearch]
  );

  const filteredItems = useMemo(() => {
    if (!selectedCat) return [];
    return items
      .filter(i => i.categoryId === selectedCat.id)
      .filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()));
  }, [items, selectedCat, itemSearch]);

  const handleSaveIssue = async (payload) => {
    await addIssue(payload);
    showToast(`Issue recorded! Stock updated for "${selectedItem.name}"`, 'success');
    setSelectedItem(null);
  };

  const handleDeleteItem = async () => {
    setDeleting(true);
    try {
      const name = confirmItem.name;
      await deleteItem(confirmItem.id);
      if (selectedItem?.id === confirmItem.id) setSelectedItem(null);
      showToast(`"${name}" deleted`, 'success');
    } catch {
      showToast('Failed to delete item', 'error');
    } finally {
      setDeleting(false);
      setConfirmItem(null);
    }
  };

  const stockColor = (item) => {
    const s = Number(item.currentStock);
    const t = Number(item.threshold || 5);
    if (s <= t)      return 'text-red-400';
    if (s <= t * 2)  return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div id="issue-page" className="min-h-screen pt-16 pb-12 px-4 md:px-8" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <Toast />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="py-8 page-enter">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📤</span>
            <h1 className="text-3xl font-bold text-white heading">Material Issue</h1>
          </div>
          <p className="text-white/40 text-sm mono ml-12">Issue materials to personnel with full approval chain</p>
        </div>

        {selectedItem ? (
          <IssueForm
            item={selectedItem}
            category={getCategoryById(selectedItem.categoryId)}
            onSave={handleSaveIssue}
            onCancel={() => setSelectedItem(null)}
          />
        ) : (
          <>
            {/* Categories */}
            <div className="mb-8 page-enter">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/80 font-semibold text-sm mono tracking-widest uppercase">Categories</h2>
                <input
                  className="field-input text-xs"
                  style={{ width: 200 }}
                  placeholder="Search categories…"
                  value={catSearch}
                  onChange={e => setCatSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">
                {filteredCats.map(cat => (
                  <button
                    key={cat.id}
                    id={`issue-cat-pill-${cat.id}`}
                    onClick={() => { setSelectedCat(cat); setItemSearch(''); }}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all card-hover ${
                      selectedCat?.id === cat.id ? 'pill-active' : 'bg-surface border-border text-text-secondary hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Items */}
            {selectedCat && (
              <div className="page-enter">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white/80 font-semibold text-sm mono tracking-widest uppercase">
                    Items — {selectedCat.name}
                  </h2>
                  <input
                    className="field-input text-xs"
                    style={{ width: 200 }}
                    placeholder="Search items…"
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                  />
                </div>

                {filteredItems.length === 0 ? (
                  <div className="glass-card-dark p-10 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-white/40 mono text-sm">No items in this category.</p>
                  </div>
                ) : (
                  <div className="glass-card-dark overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-5 py-3 text-xs mono text-white/30 tracking-widest">ITEM NAME</th>
                          <th className="text-right px-5 py-3 text-xs mono text-white/30 tracking-widest">CURRENT STOCK</th>
                          <th className="text-right px-5 py-3 text-xs mono text-white/30 tracking-widest">LAST ENTRY</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => (
                          <tr key={item.id} id={`issue-item-row-${item.id}`} className="border-b border-white/5 table-row-hover">
                            <td className="px-5 py-4 text-white/90 text-sm">{item.name}</td>
                            <td className={`px-5 py-4 text-right font-bold mono ${stockColor(item)}`}>
                              {item.currentStock}
                              {Number(item.currentStock) <= Number(item.threshold || 5) && (
                                <span className="ml-2 text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full">LOW</span>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right text-white/30 text-xs mono">{item.lastEntryDate || '—'}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  id={`issue-btn-${item.id}`}
                                  onClick={() => setSelectedItem(item)}
                                  disabled={Number(item.currentStock) === 0}
                                  className="px-4 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs hover:bg-sky-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  {Number(item.currentStock) === 0 ? 'Out of Stock' : 'Issue'}
                                </button>
                                <button
                                  id={`delete-issue-item-${item.id}`}
                                  onClick={() => setConfirmItem(item)}
                                  className="p-1.5 rounded-lg text-red-400/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                  title={`Delete "${item.name}"`}
                                >
                                  <TrashIcon size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!selectedCat && (
              <div className="glass-card-dark p-12 text-center mt-4">
                <div className="text-5xl mb-4">📂</div>
                <p className="text-white/40">Select a category above to view items for issuance.</p>
              </div>
            )}
          </>
        )}
      </div>

      {confirmItem && (
        <ConfirmModal
          title={`Delete "${confirmItem.name}"?`}
          message={`This will permanently delete this item and all its entry/issue history. Current stock: ${confirmItem.currentStock} units. This cannot be undone.`}
          confirmText="Delete Item"
          loading={deleting}
          onConfirm={handleDeleteItem}
          onCancel={() => setConfirmItem(null)}
        />
      )}
    </div>
  );
}
