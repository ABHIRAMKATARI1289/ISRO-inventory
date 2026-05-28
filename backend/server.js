/**
 * URSC Store DBMS — Backend Server
 * Node.js + Express + CSV Storage + node-cron Backups
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cron = require('node-cron');
const csvParser = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.resolve(process.env.DATA_DIR || './ursc-store-data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const BACKUP_LOG = path.join(DATA_DIR, 'backup.log');
const MAX_BACKUPS = 8;

// ── CSV file paths ──────────────────────────────────────────────────────────
const FILES = {
  categories: path.join(DATA_DIR, 'categories.csv'),
  items:       path.join(DATA_DIR, 'items.csv'),
  entries:     path.join(DATA_DIR, 'entries.csv'),
  issues:      path.join(DATA_DIR, 'issues.csv'),
};

const HEADERS = {
  categories: ['id','name','createdAt'],
  items:       ['id','categoryId','name','currentStock','lastEntryDate','threshold'],
  entries:     ['id','itemId','categoryId','indentingOfficer','date','qtyReceived','openingQty','closingQty'],
  issues:      ['id','itemId','categoryId','requestedBy','approvedBy','date','qtyIssued','openingQty','closingQty'],
};

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Utility: ensure data dir + CSV files ────────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  for (const [key, filePath] of Object.entries(FILES)) {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, HEADERS[key].join(',') + '\n');
      console.log(`[INIT] Created missing CSV: ${filePath}`);
    }
  }
}

// ── Utility: read CSV ────────────────────────────────────────────────────────
function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) return resolve(results);
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', row => results.push(row))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// ── Utility: atomic write CSV ────────────────────────────────────────────────
async function writeCsv(filePath, headers, rows) {
  const tmpPath = filePath + '.tmp';
  const writer = createObjectCsvWriter({
    path: tmpPath,
    header: headers.map(h => ({ id: h, title: h })),
  });
  await writer.writeRecords(rows);
  fs.renameSync(tmpPath, filePath);
}

// ── Utility: generate ID ─────────────────────────────────────────────────────
function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Utility: append row (atomic) ─────────────────────────────────────────────
async function appendRow(key, row) {
  const rows = await readCsv(FILES[key]);
  rows.push(row);
  await writeCsv(FILES[key], HEADERS[key], rows);
}

// ── Backup Utilities ─────────────────────────────────────────────────────────
function logBackup(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(BACKUP_LOG, line);
  console.log('[BACKUP]', msg);
}

async function runBackup() {
  const dateStr = new Date().toISOString().slice(0, 10);
  const backupFolder = path.join(BACKUPS_DIR, `backup_${dateStr}`);
  fs.mkdirSync(backupFolder, { recursive: true });

  for (const [key, src] of Object.entries(FILES)) {
    const dest = path.join(backupFolder, `${key}.csv`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
    }
  }
  logBackup(`Backup created: ${backupFolder}`);

  // Prune old backups — keep latest MAX_BACKUPS
  const backupDirs = fs.readdirSync(BACKUPS_DIR)
    .filter(d => d.startsWith('backup_'))
    .sort()
    .reverse();

  if (backupDirs.length > MAX_BACKUPS) {
    const toDelete = backupDirs.slice(MAX_BACKUPS);
    for (const d of toDelete) {
      const fullPath = path.join(BACKUPS_DIR, d);
      fs.rmSync(fullPath, { recursive: true, force: true });
      logBackup(`Deleted old backup: ${d}`);
    }
  }
  return backupFolder;
}

// ── Auto-restore from backup if primary data is missing ─────────────────────
function autoRestoreIfNeeded() {
  const anyMissing = Object.values(FILES).some(f => !fs.existsSync(f));
  if (!anyMissing) return;

  if (!fs.existsSync(BACKUPS_DIR)) return;
  const backupDirs = fs.readdirSync(BACKUPS_DIR)
    .filter(d => d.startsWith('backup_'))
    .sort()
    .reverse();

  if (backupDirs.length === 0) {
    console.warn('[WARN] No backups found. Starting fresh.');
    return;
  }

  const latest = path.join(BACKUPS_DIR, backupDirs[0]);
  console.warn(`[WARN] Primary data missing/corrupted. Restoring from: ${latest}`);

  for (const [key, dest] of Object.entries(FILES)) {
    const src = path.join(latest, `${key}.csv`);
    if (fs.existsSync(src) && !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`[RESTORE] Restored ${key}.csv from backup`);
    }
  }
  logBackup(`Auto-restored from backup: ${latest}`);
}

// ── Migration: add threshold column to existing items.csv ───────────────────
async function migrateItemsThreshold() {
  if (!fs.existsSync(FILES.items)) return;
  const rows = await readCsv(FILES.items);
  if (rows.length === 0) return;
  if ('threshold' in rows[0]) return; // already migrated
  console.log('[MIGRATE] Adding threshold column to items.csv (default: 5)');
  const migrated = rows.map(r => ({ ...r, threshold: '5' }));
  await writeCsv(FILES.items, HEADERS.items, migrated);
  console.log('[MIGRATE] Done.');
}

// ── Startup ────────────────────────────────────────────────────────────────
ensureDataDir();
autoRestoreIfNeeded();
migrateItemsThreshold().catch(e => console.error('[MIGRATE ERROR]', e.message));

// ── Schedule weekly backup: Sunday midnight ──────────────────────────────────
cron.schedule('0 0 * * 0', async () => {
  console.log('[CRON] Weekly backup triggered');
  await runBackup();
});

// Compute and log next Sunday midnight
(function logNextBackup() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  console.log(`[BACKUP] Next backup scheduled for: ${next.toDateString()} 00:00`);
})();

// ═══════════════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ── Categories ───────────────────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const rows = await readCsv(FILES.categories);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const row = { id: genId(), name, createdAt: new Date().toISOString() };
    await appendRow('categories', row);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Items ─────────────────────────────────────────────────────────────────────
app.get('/api/items', async (req, res) => {
  try {
    const rows = await readCsv(FILES.items);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { categoryId, name, currentStock = 0, threshold = 5 } = req.body;
    if (!categoryId || !name) return res.status(400).json({ error: 'categoryId and name required' });
    const row = {
      id: genId(),
      categoryId,
      name,
      currentStock: String(currentStock),
      lastEntryDate: new Date().toISOString().slice(0, 10),
      threshold: String(threshold),
    };
    await appendRow('items', row);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Update item threshold ─────────────────────────────────────────────────────
app.patch('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { threshold } = req.body;
    if (threshold === undefined) return res.status(400).json({ error: 'threshold required' });
    const items = await readCsv(FILES.items);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Item not found' });
    items[idx].threshold = String(Number(threshold));
    await writeCsv(FILES.items, HEADERS.items, items);
    res.json(items[idx]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Delete item (cascade: remove related entries & issues) ─────────────────
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [items, entries, issues] = await Promise.all([
      readCsv(FILES.items),
      readCsv(FILES.entries),
      readCsv(FILES.issues),
    ]);
    const exists = items.find(i => i.id === id);
    if (!exists) return res.status(404).json({ error: 'Item not found' });

    await Promise.all([
      writeCsv(FILES.items,   HEADERS.items,   items.filter(i => i.id !== id)),
      writeCsv(FILES.entries, HEADERS.entries, entries.filter(e => e.itemId !== id)),
      writeCsv(FILES.issues,  HEADERS.issues,  issues.filter(i => i.itemId !== id)),
    ]);
    res.json({ success: true, deleted: id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Delete category (cascade: remove all items + their entries & issues) ────
app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [categories, items, entries, issues] = await Promise.all([
      readCsv(FILES.categories),
      readCsv(FILES.items),
      readCsv(FILES.entries),
      readCsv(FILES.issues),
    ]);
    const exists = categories.find(c => c.id === id);
    if (!exists) return res.status(404).json({ error: 'Category not found' });

    const itemIds = new Set(items.filter(i => i.categoryId === id).map(i => i.id));
    await Promise.all([
      writeCsv(FILES.categories, HEADERS.categories, categories.filter(c => c.id !== id)),
      writeCsv(FILES.items,      HEADERS.items,      items.filter(i => i.categoryId !== id)),
      writeCsv(FILES.entries,    HEADERS.entries,    entries.filter(e => !itemIds.has(e.itemId))),
      writeCsv(FILES.issues,     HEADERS.issues,     issues.filter(i => !itemIds.has(i.itemId))),
    ]);
    res.json({ success: true, deleted: id, itemsRemoved: itemIds.size });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Low stock alerts ─────────────────────────────────────────────────────────
app.get('/api/alerts', async (req, res) => {
  try {
    const [items, categories] = await Promise.all([readCsv(FILES.items), readCsv(FILES.categories)]);
    const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
    const alerts = items
      .filter(i => Number(i.currentStock) <= Number(i.threshold || 5))
      .map(i => ({
        ...i,
        categoryName: catMap[i.categoryId] || '—',
        deficit: Number(i.threshold || 5) - Number(i.currentStock),
      }))
      .sort((a, b) => a.deficit - b.deficit)
      .reverse();
    res.json(alerts);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Entries ───────────────────────────────────────────────────────────────────
app.get('/api/entries', async (req, res) => {
  try {
    const rows = await readCsv(FILES.entries);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const { itemId, categoryId, indentingOfficer, date, qtyReceived } = req.body;
    if (!itemId || !qtyReceived) return res.status(400).json({ error: 'itemId and qtyReceived required' });

    // Read current item stock
    const items = await readCsv(FILES.items);
    const itemIdx = items.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return res.status(404).json({ error: 'Item not found' });

    const openingQty = Number(items[itemIdx].currentStock) || 0;
    const closingQty = openingQty + Number(qtyReceived);

    // Update item stock
    items[itemIdx].currentStock = String(closingQty);
    items[itemIdx].lastEntryDate = date || new Date().toISOString().slice(0, 10);
    await writeCsv(FILES.items, HEADERS.items, items);

    const row = {
      id: genId(),
      itemId,
      categoryId,
      indentingOfficer,
      date: date || new Date().toISOString().slice(0, 10),
      qtyReceived: String(qtyReceived),
      openingQty: String(openingQty),
      closingQty: String(closingQty),
    };
    await appendRow('entries', row);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Issues ─────────────────────────────────────────────────────────────────────
app.get('/api/issues', async (req, res) => {
  try {
    const rows = await readCsv(FILES.issues);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const { itemId, categoryId, requestedBy, approvedBy, date, qtyIssued } = req.body;
    if (!itemId || !qtyIssued) return res.status(400).json({ error: 'itemId and qtyIssued required' });

    const items = await readCsv(FILES.items);
    const itemIdx = items.findIndex(i => i.id === itemId);
    if (itemIdx === -1) return res.status(404).json({ error: 'Item not found' });

    const openingQty = Number(items[itemIdx].currentStock) || 0;
    if (Number(qtyIssued) > openingQty) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    const closingQty = openingQty - Number(qtyIssued);

    items[itemIdx].currentStock = String(closingQty);
    await writeCsv(FILES.items, HEADERS.items, items);

    const row = {
      id: genId(),
      itemId,
      categoryId,
      requestedBy,
      approvedBy,
      date: date || new Date().toISOString().slice(0, 10),
      qtyIssued: String(qtyIssued),
      openingQty: String(openingQty),
      closingQty: String(closingQty),
    };
    await appendRow('issues', row);
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Backup endpoint ──────────────────────────────────────────────────────────
app.post('/api/backup', async (req, res) => {
  try {
    const folder = await runBackup();
    res.json({ success: true, folder });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── AI Insight (Anthropic Claude) ─────────────────────────────────────────
app.post('/api/ai-insight', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return res.status(200).json({
        mock: true,
        insight: generateMockInsight(req.body),
      });
    }

    const client = new Anthropic({ apiKey });
    const { categories, items, entries, issues } = req.body;

    const prompt = `You are an inventory intelligence analyst for URSC (U R Rao Satellite Centre), ISRO Bangalore.
Analyze this store inventory data and produce a concise executive insight report.

INVENTORY DATA:
${JSON.stringify({ categories, items, entries, issues }, null, 2)}

Provide:
1. CRITICAL LOW STOCK ALERTS — items with stock < 3 units
2. HIGH-MOVEMENT CATEGORIES — categories with most activity
3. ANOMALY DETECTION — unusual patterns in entries/issues
4. PROCUREMENT RECOMMENDATIONS — specific items to reorder
5. OVERALL STOCK HEALTH SCORE (0-100)

Format as a professional ISRO internal memo. Be concise and actionable.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ insight: message.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function generateMockInsight(data) {
  const items = data.items || [];
  const lowStock = items.filter(i => Number(i.currentStock) < 3);
  return `URSC STORE INTELLIGENCE BRIEF — ${new Date().toLocaleDateString('en-IN')}
CLASSIFICATION: INTERNAL USE ONLY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. CRITICAL LOW STOCK ALERTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${lowStock.length > 0 
  ? lowStock.map(i => `⚠  ${i.name}: ${i.currentStock} units remaining — IMMEDIATE PROCUREMENT ADVISED`).join('\n')
  : '✓  All items are adequately stocked.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. HIGH-MOVEMENT CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on entry/issue frequency, Electronics and Consumables show the highest 
throughput. Recommend quarterly stock review for these categories.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. ANOMALY DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
No significant anomalies detected in current dataset.
Issue-to-receipt ratio appears balanced across categories.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. PROCUREMENT RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Isopropyl Alcohol 99% — reorder 50 units (cleaning critical for lab ops)
• Kapton Tape — reorder 30 rolls (high-demand for thermal insulation work)
• M3 Hex Bolts — reorder 500 units (consumable; always maintain buffer stock)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5. OVERALL STOCK HEALTH SCORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Score: 74/100 — ADEQUATE
${lowStock.length > 0 ? `Action Required: ${lowStock.length} item(s) critically low.` : 'Inventory is in a healthy state.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTE: This is a demo insight. Set GROK_API_KEY in backend/.env for 
live AI-powered analysis via Grok.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 URSC Store DBMS Backend running on http://localhost:${PORT}`);
  console.log(`📂 Data directory: ${DATA_DIR}\n`);
});
