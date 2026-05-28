import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { useStore } from '../context/StoreContext';

/* ── KPI Card ────────────────────────────────────────────────────────── */
function KpiCard({ label, value, icon, color }) {
  return (
    <div className="glass-card-dark p-5 flex items-center gap-4 card-hover">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${color} bg-opacity-10`}
        style={{ background: 'rgba(245,158,11,0.1)' }}>
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold mono ${color}`}>{value}</div>
        <div className="text-white/40 text-xs mono tracking-wide mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ── Custom Tooltip ──────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-dark px-3 py-2.5 text-xs">
      <p className="text-white/60 mono mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="mono">
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

/* ── Table sort helper ───────────────────────────────────────────────── */
function useSortable(data, defaultKey) {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortDir, setSortDir] = useState('desc');

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const av = isNaN(Number(a[sortKey])) ? (a[sortKey] || '').toLowerCase() : Number(a[sortKey]);
      const bv = isNaN(Number(b[sortKey])) ? (b[sortKey] || '').toLowerCase() : Number(b[sortKey]);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => (
    <span className="ml-1 opacity-40">
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return { sorted, toggleSort, SortIcon, sortKey, sortDir };
}

/* ── Stock color ─────────────────────────────────────────────────────── */
const stockColor = (v) => {
  const n = Number(v);
  if (n < 3)  return 'text-red-400';
  if (n <= 10) return 'text-amber-400';
  return 'text-emerald-400';
};

/* ── CSV Export ──────────────────────────────────────────────────────── */
function exportCsv(rows, filename) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Main Reports Page ───────────────────────────────────────────────── */
export default function ReportsPage() {
  const { categories, items, entries, issues, totalItems, totalQtyInStore, totalReceived, totalIssued, getCategoryById } = useStore();

  const [tableSearch,   setTableSearch]   = useState('');
  const [catFilter,     setCatFilter]     = useState('all');
  const [dateFrom,      setDateFrom]      = useState('');
  const [dateTo,        setDateTo]        = useState('');
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiInsight,     setAiInsight]     = useState('');
  const [aiError,       setAiError]       = useState('');
  const [activeSection, setActiveSection] = useState('stock');

  /* ── Stock Table Data ── */
  const stockTableData = useMemo(() => {
    return items
      .filter(i => i.name.toLowerCase().includes(tableSearch.toLowerCase()))
      .filter(i => catFilter === 'all' || i.categoryId === catFilter)
      .map(item => {
        const cat = getCategoryById(item.categoryId);
        const totalRec = entries
          .filter(e => e.itemId === item.id)
          .reduce((s, e) => s + Number(e.qtyReceived), 0);
        const totalIss = issues
          .filter(i2 => i2.itemId === item.id)
          .reduce((s, i2) => s + Number(i2.qtyIssued), 0);
        const initStock = totalRec - totalIss - Number(item.currentStock);
        const openingStock = Math.max(0, Number(item.currentStock) - totalRec + totalIss);
        return {
          categoryName: cat?.name || '—',
          categoryId: item.categoryId,
          itemName: item.name,
          openingStock: String(openingStock),
          totalReceived: String(totalRec),
          totalIssued: String(totalIss),
          currentStock: item.currentStock,
        };
      });
  }, [items, entries, issues, getCategoryById, tableSearch, catFilter]);

  const { sorted: sortedStock, toggleSort: toggleStockSort, SortIcon: StockSortIcon } = useSortable(stockTableData, 'currentStock');

  /* ── Entry History ── */
  const entryHistory = useMemo(() => {
    return entries
      .filter(e => catFilter === 'all' || e.categoryId === catFilter)
      .filter(e => {
        if (dateFrom && e.date < dateFrom) return false;
        if (dateTo && e.date > dateTo) return false;
        return true;
      })
      .map(e => {
        const item = items.find(i => i.id === e.itemId);
        const cat  = getCategoryById(e.categoryId);
        return {
          date: e.date,
          category: cat?.name || '—',
          item: item?.name || '—',
          qtyReceived: e.qtyReceived,
          indentingOfficer: e.indentingOfficer,
          openingQty: e.openingQty,
          closingQty: e.closingQty,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, items, getCategoryById, catFilter, dateFrom, dateTo]);

  /* ── Issue History ── */
  const issueHistory = useMemo(() => {
    return issues
      .filter(i => catFilter === 'all' || i.categoryId === catFilter)
      .filter(i => {
        if (dateFrom && i.date < dateFrom) return false;
        if (dateTo && i.date > dateTo) return false;
        return true;
      })
      .map(i => {
        const item = items.find(it => it.id === i.itemId);
        const cat  = getCategoryById(i.categoryId);
        return {
          date: i.date,
          category: cat?.name || '—',
          item: item?.name || '—',
          qtyIssued: i.qtyIssued,
          requestedBy: i.requestedBy,
          approvedBy: i.approvedBy,
          openingQty: i.openingQty,
          closingQty: i.closingQty,
        };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [issues, items, getCategoryById, catFilter, dateFrom, dateTo]);

  /* ── Bar Chart — Stock by Category ── */
  const barData = useMemo(() => {
    return categories.map(cat => ({
      category: cat.name,
      stock: items
        .filter(i => i.categoryId === cat.id)
        .reduce((s, i) => s + Number(i.currentStock), 0),
    }));
  }, [categories, items]);

  const BAR_COLORS = ['#F59E0B', '#10B981', '#60A5FA', '#A78BFA', '#F472B6', '#34D399'];

  /* ── Line Chart — Entries vs Issues over time ── */
  const lineData = useMemo(() => {
    const dateMap = {};
    entries.forEach(e => {
      if (!dateMap[e.date]) dateMap[e.date] = { date: e.date, entries: 0, issues: 0 };
      dateMap[e.date].entries += Number(e.qtyReceived);
    });
    issues.forEach(i => {
      if (!dateMap[i.date]) dateMap[i.date] = { date: i.date, entries: 0, issues: 0 };
      dateMap[i.date].issues += Number(i.qtyIssued);
    });
    return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, issues]);

  /* ── AI Insight ── */
  const generateInsight = async () => {
    setAiLoading(true);
    setAiError('');
    setAiInsight('');
    try {
      const { data } = await axios.post('/api/ai-insight', { categories, items, entries, issues });
      setAiInsight(data.insight);
    } catch (e) {
      setAiError(e.response?.data?.error || 'Failed to generate insight');
    } finally {
      setAiLoading(false);
    }
  };

  const navSections = [
    { id: 'stock',   label: 'Stock Levels' },
    { id: 'entries', label: 'Entry Log' },
    { id: 'issues',  label: 'Issue Log' },
    { id: 'charts',  label: 'Charts' },
    { id: 'ai',      label: 'AI Insight' },
  ];

  return (
    <div id="reports-page" className="min-h-screen pt-16 pb-16 px-4 md:px-8" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <Toast />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="py-8 page-enter">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">📊</span>
            <h1 className="text-3xl font-bold text-white heading">Reports & Intelligence</h1>
          </div>
          <p className="text-white/40 text-sm mono ml-12">Live inventory dashboards, history logs, and AI-powered insights</p>
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 page-enter">
          <KpiCard label="TOTAL ITEMS TRACKED" value={totalItems}        icon="📦" color="text-amber-400" />
          <KpiCard label="TOTAL QTY IN STORE"  value={totalQtyInStore}   icon="🏪" color="text-emerald-400" />
          <KpiCard label="TOTAL ENTRIES"        value={entries.length}    icon="📥" color="text-sky-400" />
          <KpiCard label="TOTAL ISSUES"         value={issues.length}     icon="📤" color="text-violet-400" />
        </div>

        {/* ── Filters Bar ── */}
        <div className="glass-card-dark p-4 mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-white/30 text-xs mono">FILTER:</span>
          <select
            id="reports-cat-filter"
            className="field-input text-xs"
            style={{ width: 180 }}
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className="field-input text-xs" style={{ width: 150 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <span className="text-white/30 text-xs mono">to</span>
          <input type="date" className="field-input text-xs" style={{ width: 150 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
          <button onClick={() => { setCatFilter('all'); setDateFrom(''); setDateTo(''); }} className="text-xs text-white/30 hover:text-amber-400 mono transition-colors">
            Clear filters ✕
          </button>

          <div className="flex-1" />
          <button
            id="export-csv-btn"
            onClick={() => exportCsv(sortedStock, `ursc-stock-${new Date().toISOString().slice(0,10)}.csv`)}
            className="px-4 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-all"
          >
            Export CSV ↓
          </button>
        </div>

        {/* ── Section Nav ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {navSections.map(s => (
            <button
              key={s.id}
              id={`reports-tab-${s.id}`}
              onClick={() => setActiveSection(s.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                activeSection === s.id ? 'pill-active' : 'bg-surface border-border text-text-secondary hover:text-white hover:border-white/20'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ══ STOCK LEVELS TABLE ══════════════════════════════════════════ */}
        {activeSection === 'stock' && (
          <div className="page-enter">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white/70 font-semibold text-sm mono tracking-widest uppercase">Stock Level Table</h2>
              <input
                id="stock-table-search"
                className="field-input text-xs"
                style={{ width: 220 }}
                placeholder="Search items…"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
              />
            </div>
            <div className="glass-card-dark overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      ['categoryName', 'CATEGORY'],
                      ['itemName',     'ITEM'],
                      ['openingStock', 'OPENING'],
                      ['totalReceived','RECEIVED'],
                      ['totalIssued',  'ISSUED'],
                      ['currentStock', 'CURRENT STOCK'],
                    ].map(([key, label]) => (
                      <th key={key} onClick={() => toggleStockSort(key)}
                        className="text-left px-5 py-3 text-xs mono text-white/30 tracking-widest cursor-pointer hover:text-amber-400 transition-colors">
                        {label}<StockSortIcon col={key} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedStock.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 table-row-hover">
                      <td className="px-5 py-3 text-white/50 text-sm">{row.categoryName}</td>
                      <td className="px-5 py-3 text-white/90 text-sm font-medium">{row.itemName}</td>
                      <td className="px-5 py-3 text-white/60 text-sm mono">{row.openingStock}</td>
                      <td className="px-5 py-3 text-emerald-400 text-sm mono font-semibold">+{row.totalReceived}</td>
                      <td className="px-5 py-3 text-red-400 text-sm mono font-semibold">-{row.totalIssued}</td>
                      <td className={`px-5 py-3 text-sm mono font-bold ${stockColor(row.currentStock)}`}>
                        {row.currentStock}
                        {Number(row.currentStock) < 3 && <span className="ml-2 text-[10px] bg-red-500/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded-full">LOW</span>}
                      </td>
                    </tr>
                  ))}
                  {sortedStock.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-8 text-center text-white/30 mono text-sm">No items found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ENTRY HISTORY ════════════════════════════════════════════════ */}
        {activeSection === 'entries' && (
          <div className="page-enter">
            <h2 className="text-white/70 font-semibold text-sm mono tracking-widest uppercase mb-3">Entry History Log</h2>
            <div className="glass-card-dark overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['DATE','CATEGORY','ITEM','QTY RECEIVED','INDENTING OFFICER','OPENING','CLOSING'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs mono text-white/30 tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entryHistory.map((e, i) => (
                    <tr key={i} className="border-b border-white/5 table-row-hover">
                      <td className="px-5 py-3 text-white/50 text-xs mono">{e.date}</td>
                      <td className="px-5 py-3 text-white/60 text-sm">{e.category}</td>
                      <td className="px-5 py-3 text-white/90 text-sm font-medium">{e.item}</td>
                      <td className="px-5 py-3 text-emerald-400 mono font-semibold">+{e.qtyReceived}</td>
                      <td className="px-5 py-3 text-white/60 text-sm">{e.indentingOfficer}</td>
                      <td className="px-5 py-3 text-white/50 mono text-sm">{e.openingQty}</td>
                      <td className="px-5 py-3 text-sky-400 mono font-semibold">{e.closingQty}</td>
                    </tr>
                  ))}
                  {entryHistory.length === 0 && (
                    <tr><td colSpan="7" className="px-5 py-8 text-center text-white/30 mono text-sm">No entries found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ ISSUE HISTORY ════════════════════════════════════════════════ */}
        {activeSection === 'issues' && (
          <div className="page-enter">
            <h2 className="text-white/70 font-semibold text-sm mono tracking-widest uppercase mb-3">Issue History Log</h2>
            <div className="glass-card-dark overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {['DATE','CATEGORY','ITEM','QTY ISSUED','REQUESTED BY','APPROVED BY','OPENING','CLOSING'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs mono text-white/30 tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {issueHistory.map((i, idx) => (
                    <tr key={idx} className="border-b border-white/5 table-row-hover">
                      <td className="px-5 py-3 text-white/50 text-xs mono">{i.date}</td>
                      <td className="px-5 py-3 text-white/60 text-sm">{i.category}</td>
                      <td className="px-5 py-3 text-white/90 text-sm font-medium">{i.item}</td>
                      <td className="px-5 py-3 text-red-400 mono font-semibold">-{i.qtyIssued}</td>
                      <td className="px-5 py-3 text-white/60 text-sm">{i.requestedBy}</td>
                      <td className="px-5 py-3 text-white/60 text-sm">{i.approvedBy}</td>
                      <td className="px-5 py-3 text-white/50 mono text-sm">{i.openingQty}</td>
                      <td className="px-5 py-3 text-amber-400 mono font-semibold">{i.closingQty}</td>
                    </tr>
                  ))}
                  {issueHistory.length === 0 && (
                    <tr><td colSpan="8" className="px-5 py-8 text-center text-white/30 mono text-sm">No issues found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ CHARTS ═══════════════════════════════════════════════════════ */}
        {activeSection === 'charts' && (
          <div className="page-enter space-y-6">
            {/* Bar Chart */}
            <div className="glass-card-dark p-6">
              <h3 className="text-white/70 text-sm mono tracking-widest uppercase mb-5">Stock Levels by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="category" tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="stock" name="Total Stock" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="glass-card-dark p-6">
              <h3 className="text-white/70 text-sm mono tracking-widest uppercase mb-5">Entries vs Issues Over Time</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'IBM Plex Mono' }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="entries" name="Entries (Qty)" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="issues"  name="Issues (Qty)"  stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ AI INSIGHT ═══════════════════════════════════════════════════ */}
        {activeSection === 'ai' && (
          <div className="page-enter">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold text-lg">Intelligence Brief</h2>
                <p className="text-white/40 text-xs mono mt-0.5">AI-powered inventory analysis via Claude Sonnet</p>
              </div>
              <button
                id="generate-insight-btn"
                onClick={generateInsight}
                disabled={aiLoading}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-black glow-btn disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}
              >
                {aiLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"/>
                    </svg>
                    Analysing…
                  </span>
                ) : '⚡ Generate Insight Report'}
              </button>
            </div>

            {aiError && (
              <div className="text-red-400 text-xs mono bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                ⚠ {aiError}
              </div>
            )}

            {!aiInsight && !aiLoading && (
              <div className="glass-card-dark p-12 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <p className="text-white/40 text-sm mono">Click "Generate Insight Report" to analyse your inventory with AI.</p>
                <p className="text-white/20 text-xs mono mt-2">Powered by Claude Sonnet — generating a live intelligence brief.</p>
              </div>
            )}

            {aiInsight && (
              <div>
                {/* URSC letterhead header */}
                <div className="glass-card-dark mb-3 px-6 py-4 flex items-center gap-4 border-b-0 rounded-b-none"
                  style={{ borderBottom: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L9 7H5l3 3-1.5 5L12 12l5.5 3L16 10l3-3h-4L12 2z" fill="#F59E0B"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-amber-400 font-bold text-sm mono tracking-widest">ISRO · URSC BANGALORE</div>
                    <div className="text-white/30 text-xs mono">Store Intelligence Division · {new Date().toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="ml-auto px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                    <span className="text-amber-400 text-[10px] mono tracking-widest">INTERNAL USE ONLY</span>
                  </div>
                </div>
                <div id="ai-insight-content" className="ai-brief rounded-t-none" style={{ borderRadius: '0 0 1rem 1rem' }}>
                  {aiInsight}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
