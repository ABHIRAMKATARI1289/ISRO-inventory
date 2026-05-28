import React, { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { useStore } from '../context/StoreContext';

/* ── Trash Icon ──────────────────────────────────────────────────────── */
function TrashIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M19 6l-1 14H6L5 6M10 6V4h4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

/* ── Add Category Modal ──────────────────────────────────────────────── */
function AddCategoryModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(name.trim());
    setLoading(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card-dark w-full max-w-sm mx-4 p-6" style={{ animation: 'scaleIn 0.25s ease both' }}>
        <h3 className="text-white font-semibold mb-4">Add New Category</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label">Category Name</label>
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Optical" autoFocus />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-sm transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all disabled:opacity-50">
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Add Item Modal ──────────────────────────────────────────────────── */
function AddItemModal({ categoryId, onClose, onAdd }) {
  const [name,      setName]      = useState('');
  const [threshold, setThreshold] = useState('5');
  const [loading,   setLoading]   = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onAdd(categoryId, name.trim(), Number(threshold) || 5);
    setLoading(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card-dark w-full max-w-sm mx-4 p-6" style={{ animation: 'scaleIn 0.25s ease both' }}>
        <h3 className="text-white font-semibold mb-4">Add New Item</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="field-label">Item Name</label>
            <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wire Stripper" autoFocus />
          </div>
          <div>
            <label className="field-label">Alert Threshold (units)</label>
            <input type="number" min="0" className="field-input" value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="5" />
            <p className="text-white/30 text-xs mono mt-1">Alert fires when stock ≤ this value</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/80 text-sm transition-all">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all disabled:opacity-50">
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Inline Threshold Editor ─────────────────────────────────────────── */
function ThresholdEditor({ item, onSave }) {
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(item.threshold || '5');
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    await onSave(item.id, Number(value) || 0);
    setSaving(false);
    setEditing(false);
  };

  const isLow = Number(item.currentStock) <= Number(item.threshold || 5);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        <input
          type="number" min="0"
          className="field-input py-1 text-xs w-20 text-center"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
        />
        <button onClick={save} disabled={saving}
          className="px-2 py-1 rounded bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-all">
          {saving ? '…' : '✓'}
        </button>
        <button onClick={() => setEditing(false)}
          className="px-2 py-1 rounded bg-white/5 text-white/40 text-xs hover:text-white/70 transition-all">
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); setEditing(true); setValue(item.threshold || '5'); }}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs mono transition-all hover:border-amber-500/40 group ${
        isLow ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/40'
      }`}
      title="Click to edit threshold"
    >
      <span>{isLow ? '⚠' : '▣'}</span>
      <span>min {item.threshold || 5}</span>
      <span className="opacity-0 group-hover:opacity-60 transition-opacity text-amber-400">✎</span>
    </button>
  );
}

/* ── Entry Form ──────────────────────────────────────────────────────── */
function EntryForm({ item, category, onSave, onCancel }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date,    setDate]    = useState(today);
  const [officer, setOfficer] = useState('');
  const [qty,     setQty]     = useState('');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  const openingQty  = Number(item.currentStock) || 0;
  const qtyReceived = Number(qty) || 0;
  const closingQty  = openingQty + qtyReceived;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!qty || qtyReceived <= 0) { setError('Quantity must be greater than 0'); return; }
    if (!officer.trim()) { setError('Indenting officer name is required'); return; }
    setSaving(true);
    try {
      await onSave({ itemId: item.id, categoryId: category.id, indentingOfficer: officer.trim(), date, qtyReceived });
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save entry');
      setSaving(false);
    }
  };

  return (
    <div className="glass-card-dark p-6 max-w-2xl mx-auto page-enter">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
          <span className="text-sm">📥</span>
        </div>
        <div>
          <h2 className="text-white font-semibold">New Material Entry</h2>
          <p className="text-white/40 text-xs mono">{category.name} · {item.name}</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="field-label">Item Name</label><input className="field-input" value={item.name} readOnly /></div>
          <div><label className="field-label">Category</label><input className="field-input" value={category.name} readOnly /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Date of Entry</label>
            <input type="date" className="field-input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Indenting Officer</label>
            <input type="text" className="field-input" value={officer} onChange={e => setOfficer(e.target.value)} placeholder="Officer name" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="field-label">Opening Qty</label><input className="field-input text-amber-400" value={openingQty} readOnly /></div>
          <div>
            <label className="field-label">Qty Received</label>
            <input type="number" min="1" className="field-input text-emerald-400" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" />
          </div>
          <div><label className="field-label">Closing Qty</label><input className="field-input text-sky-400 font-bold" value={qty ? closingQty : '—'} readOnly /></div>
        </div>
        {error && <div className="text-red-400 text-xs mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">⚠ {error}</div>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white/80 text-sm font-medium transition-all">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all disabled:opacity-50 glow-btn">
            {saving ? 'Saving...' : 'Save Entry ✓'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Main Entry Page ─────────────────────────────────────────────────── */
export default function EntryPage() {
  const {
    categories, items, addCategory, addItem, addEntry,
    updateItemThreshold, deleteItem,
    showToast, getCategoryById,
  } = useStore();

  const [selectedCat,  setSelectedCat]  = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [catSearch,    setCatSearch]    = useState('');
  const [itemSearch,   setItemSearch]   = useState('');
  const [showAddCat,   setShowAddCat]   = useState(false);
  const [showAddItem,  setShowAddItem]  = useState(false);

  // Delete confirm state
  const [confirmItem, setConfirmItem] = useState(null);
  const [deleting,    setDeleting]    = useState(false);

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

  const handleSaveEntry = async (payload) => {
    await addEntry(payload);
    showToast(`Entry saved! Stock updated for "${selectedItem.name}"`, 'success');
    setSelectedItem(null);
  };

  const handleThresholdSave = async (itemId, threshold) => {
    await updateItemThreshold(itemId, threshold);
    showToast('Alert threshold updated', 'success');
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
    const stock = Number(item.currentStock);
    const thresh = Number(item.threshold || 5);
    if (stock <= thresh)     return 'text-red-400';
    if (stock <= thresh * 2) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const catItemCount = (catId) => items.filter(i => i.categoryId === catId).length;

  return (
    <div className="min-h-screen pt-16 pb-12 px-4 md:px-8" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <Toast />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="py-8 page-enter">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📥</span>
            <h1 className="text-3xl font-bold text-white heading">Material Entry</h1>
          </div>
          <p className="text-white/40 text-sm mono ml-12">Log incoming materials and update stock records</p>
        </div>

        {selectedItem ? (
          <EntryForm
            item={selectedItem}
            category={getCategoryById(selectedItem.categoryId)}
            onSave={handleSaveEntry}
            onCancel={() => setSelectedItem(null)}
          />
        ) : (
          <>
            {/* ── Categories ─────────────────────────────────────────── */}
            <div className="mb-8 page-enter">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white/80 font-semibold text-sm mono tracking-widest uppercase">Categories</h2>
                <div className="flex gap-2">
                  <input className="field-input text-xs" style={{ width: 180 }} placeholder="Search categories…"
                    value={catSearch} onChange={e => setCatSearch(e.target.value)} />
                  <button onClick={() => setShowAddCat(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/25 transition-all whitespace-nowrap">
                    + Add Category
                  </button>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {filteredCats.map(cat => (
                  <button
                    key={cat.id}
                    id={`cat-pill-${cat.id}`}
                    onClick={() => { setSelectedCat(cat); setItemSearch(''); }}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all card-hover ${
                      selectedCat?.id === cat.id ? 'pill-active' : 'bg-surface border-border text-text-secondary hover:text-white hover:border-white/20'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-2 text-xs opacity-40">({catItemCount(cat.id)})</span>
                  </button>
                ))}
                {filteredCats.length === 0 && <p className="text-white/30 text-sm mono py-2">No categories found.</p>}
              </div>
            </div>

            {/* ── Items ──────────────────────────────────────────────── */}
            {selectedCat && (
              <div className="page-enter">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white/80 font-semibold text-sm mono tracking-widest uppercase">Items — {selectedCat.name}</h2>
                  <div className="flex gap-2">
                    <input className="field-input text-xs" style={{ width: 200 }} placeholder="Search items…"
                      value={itemSearch} onChange={e => setItemSearch(e.target.value)} />
                    <button onClick={() => setShowAddItem(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-all whitespace-nowrap">
                      + Add Item
                    </button>
                  </div>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="glass-card-dark p-10 text-center">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-white/40 mono text-sm">No items in this category yet.</p>
                    <button onClick={() => setShowAddItem(true)} className="mt-4 text-amber-400 text-sm hover:text-amber-300 transition-colors">
                      + Add first item
                    </button>
                  </div>
                ) : (
                  <div className="glass-card-dark overflow-hidden">
                    <div className="px-5 py-2.5 border-b border-white/5 bg-white/2 flex items-center gap-2">
                      <span className="text-white/20 text-xs mono">Click the threshold badge to edit · Trash icon to delete item</span>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-5 py-3 text-xs mono text-white/30 tracking-widest">ITEM NAME</th>
                          <th className="text-right px-5 py-3 text-xs mono text-white/30 tracking-widest">STOCK</th>
                          <th className="text-center px-5 py-3 text-xs mono text-white/30 tracking-widest">THRESHOLD</th>
                          <th className="text-right px-5 py-3 text-xs mono text-white/30 tracking-widest">LAST ENTRY</th>
                          <th className="px-5 py-3" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredItems.map(item => {
                          const isLow = Number(item.currentStock) <= Number(item.threshold || 5);
                          return (
                            <tr key={item.id} className={`border-b border-white/5 table-row-hover ${isLow ? 'bg-red-500/3' : ''}`}>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  {isLow && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />}
                                  <span className="text-white/90 text-sm">{item.name}</span>
                                  {isLow && <span className="text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full">LOW</span>}
                                </div>
                              </td>
                              <td className={`px-5 py-4 text-right font-bold mono ${stockColor(item)}`}>
                                {item.currentStock}
                              </td>
                              <td className="px-5 py-4 text-center">
                                <div className="flex justify-center">
                                  <ThresholdEditor item={item} onSave={handleThresholdSave} />
                                </div>
                              </td>
                              <td className="px-5 py-4 text-right text-white/30 text-xs mono">{item.lastEntryDate || '—'}</td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 justify-end">
                                  <button
                                    id={`entry-btn-${item.id}`}
                                    onClick={() => setSelectedItem(item)}
                                    className="px-4 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs hover:bg-amber-500/25 transition-all"
                                  >
                                    Add Entry
                                  </button>
                                  <button
                                    id={`delete-item-${item.id}`}
                                    onClick={() => setConfirmItem(item)}
                                    className="p-1.5 rounded-lg text-red-400/30 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                    title={`Delete "${item.name}"`}
                                  >
                                    <TrashIcon size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {!selectedCat && (
              <div className="glass-card-dark p-12 text-center mt-4">
                <div className="text-5xl mb-4">📂</div>
                <p className="text-white/40">Select a category above to view and manage items.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showAddCat && <AddCategoryModal onClose={() => setShowAddCat(false)} onAdd={addCategory} />}
      {showAddItem && selectedCat && (
        <AddItemModal categoryId={selectedCat.id} onClose={() => setShowAddItem(false)} onAdd={addItem} />
      )}

      {/* Delete Item Confirm */}
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
