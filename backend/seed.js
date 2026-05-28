/**
 * URSC Store DBMS — Seed Script
 * Populates all 4 CSV files with realistic demo data
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const DATA_DIR = path.resolve(process.env.DATA_DIR || './ursc-store-data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function writer(filename, headers) {
  return createObjectCsvWriter({
    path: path.join(DATA_DIR, filename),
    header: headers.map(h => ({ id: h, title: h })),
  });
}

async function seed() {
  console.log('🌱 Seeding URSC Store DBMS...\n');

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = [
    { id: 'cat001', name: 'Electronics',   createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'cat002', name: 'Mechanical',    createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'cat003', name: 'Consumables',   createdAt: '2025-01-01T00:00:00.000Z' },
    { id: 'cat004', name: 'Tools',         createdAt: '2025-01-15T00:00:00.000Z' },
    { id: 'cat005', name: 'Chemicals',     createdAt: '2025-01-15T00:00:00.000Z' },
    { id: 'cat006', name: 'IT Equipment',  createdAt: '2025-02-01T00:00:00.000Z' },
  ];
  await writer('categories.csv', ['id','name','createdAt']).writeRecords(categories);
  console.log('✅ categories.csv — 6 categories');

  // ── Items ───────────────────────────────────────────────────────────────
  const items = [
    { id: 'itm001', categoryId: 'cat001', name: 'Soldering Iron',            currentStock: '12', lastEntryDate: '2026-05-10', threshold: '5'   },
    { id: 'itm002', categoryId: 'cat001', name: 'Oscilloscope Probes',       currentStock: '7',  lastEntryDate: '2026-05-15', threshold: '4'   },
    { id: 'itm003', categoryId: 'cat001', name: 'Multimeter',                currentStock: '5',  lastEntryDate: '2026-04-20', threshold: '3'   },
    { id: 'itm004', categoryId: 'cat002', name: 'M3 Hex Bolts',              currentStock: '340',lastEntryDate: '2026-05-18', threshold: '100' },
    { id: 'itm005', categoryId: 'cat002', name: 'Torque Wrench Set',         currentStock: '3',  lastEntryDate: '2026-04-10', threshold: '5'   },
    { id: 'itm006', categoryId: 'cat002', name: 'Precision Screwdriver Set', currentStock: '8',  lastEntryDate: '2026-05-05', threshold: '4'   },
    { id: 'itm007', categoryId: 'cat003', name: 'Kapton Tape',               currentStock: '22', lastEntryDate: '2026-05-20', threshold: '10'  },
    { id: 'itm008', categoryId: 'cat003', name: 'Isopropyl Alcohol 99%',     currentStock: '2',  lastEntryDate: '2026-05-22', threshold: '8'   },
    { id: 'itm009', categoryId: 'cat003', name: 'Thermal Paste',             currentStock: '15', lastEntryDate: '2026-05-12', threshold: '5'   },
    { id: 'itm010', categoryId: 'cat004', name: 'Digital Caliper',           currentStock: '6',  lastEntryDate: '2026-03-30', threshold: '3'   },
    { id: 'itm011', categoryId: 'cat005', name: 'Flux Remover Spray',        currentStock: '9',  lastEntryDate: '2026-05-08', threshold: '6'   },
    { id: 'itm012', categoryId: 'cat006', name: 'Raspberry Pi 4',            currentStock: '4',  lastEntryDate: '2026-05-25', threshold: '5'   },
    { id: 'itm013', categoryId: 'cat006', name: 'USB-C Hub',                 currentStock: '11', lastEntryDate: '2026-05-01', threshold: '4'   },
  ];
  await writer('items.csv', ['id','categoryId','name','currentStock','lastEntryDate','threshold']).writeRecords(items);
  console.log('✅ items.csv — 13 items');

  // ── Entries ─────────────────────────────────────────────────────────────
  const entries = [
    { id: 'ent001', itemId:'itm001', categoryId:'cat001', indentingOfficer:'Dr. Suresh Iyer',    date:'2026-04-10', qtyReceived:'10', openingQty:'2',  closingQty:'12' },
    { id: 'ent002', itemId:'itm002', categoryId:'cat001', indentingOfficer:'Eng. Priya Nair',     date:'2026-04-15', qtyReceived:'5',  openingQty:'2',  closingQty:'7'  },
    { id: 'ent003', itemId:'itm004', categoryId:'cat002', indentingOfficer:'Lt. Ramesh Kumar',    date:'2026-04-18', qtyReceived:'200', openingQty:'140', closingQty:'340' },
    { id: 'ent004', itemId:'itm007', categoryId:'cat003', indentingOfficer:'Dr. Kavitha Rao',     date:'2026-04-22', qtyReceived:'30', openingQty:'0',  closingQty:'30' },
    { id: 'ent005', itemId:'itm008', categoryId:'cat003', indentingOfficer:'Eng. Arun Menon',     date:'2026-05-02', qtyReceived:'10', openingQty:'0',  closingQty:'10' },
    { id: 'ent006', itemId:'itm009', categoryId:'cat003', indentingOfficer:'Dr. Suresh Iyer',    date:'2026-05-12', qtyReceived:'20', openingQty:'0',  closingQty:'20' },
    { id: 'ent007', itemId:'itm012', categoryId:'cat006', indentingOfficer:'Eng. Priya Nair',     date:'2026-05-15', qtyReceived:'6',  openingQty:'0',  closingQty:'6'  },
    { id: 'ent008', itemId:'itm005', categoryId:'cat002', indentingOfficer:'Lt. Ramesh Kumar',    date:'2026-05-18', qtyReceived:'3',  openingQty:'0',  closingQty:'3'  },
    { id: 'ent009', itemId:'itm013', categoryId:'cat006', indentingOfficer:'Eng. Arun Menon',     date:'2026-05-20', qtyReceived:'15', openingQty:'0',  closingQty:'15' },
    { id: 'ent010', itemId:'itm003', categoryId:'cat001', indentingOfficer:'Dr. Kavitha Rao',     date:'2026-05-25', qtyReceived:'5',  openingQty:'0',  closingQty:'5'  },
  ];
  await writer('entries.csv', ['id','itemId','categoryId','indentingOfficer','date','qtyReceived','openingQty','closingQty']).writeRecords(entries);
  console.log('✅ entries.csv — 10 entry records');

  // ── Issues ──────────────────────────────────────────────────────────────
  const issues = [
    { id: 'iss001', itemId:'itm007', categoryId:'cat003', requestedBy:'Eng. Vijay Sharma',  approvedBy:'Dr. Suresh Iyer',  date:'2026-04-25', qtyIssued:'5',  openingQty:'30',  closingQty:'25' },
    { id: 'iss002', itemId:'itm008', categoryId:'cat003', requestedBy:'Eng. Priya Nair',    approvedBy:'Lt. Ramesh Kumar', date:'2026-05-05', qtyIssued:'4',  openingQty:'10',  closingQty:'6'  },
    { id: 'iss003', itemId:'itm001', categoryId:'cat001', requestedBy:'Eng. Arun Menon',    approvedBy:'Dr. Kavitha Rao',  date:'2026-05-10', qtyIssued:'0',  openingQty:'12',  closingQty:'12' },
    { id: 'iss004', itemId:'itm012', categoryId:'cat006', requestedBy:'Lt. Ramesh Kumar',   approvedBy:'Dr. Suresh Iyer',  date:'2026-05-20', qtyIssued:'2',  openingQty:'6',   closingQty:'4'  },
    { id: 'iss005', itemId:'itm007', categoryId:'cat003', requestedBy:'Dr. Kavitha Rao',    approvedBy:'Lt. Ramesh Kumar', date:'2026-05-22', qtyIssued:'3',  openingQty:'25',  closingQty:'22' },
    { id: 'iss006', itemId:'itm009', categoryId:'cat003', requestedBy:'Eng. Vijay Sharma',  approvedBy:'Dr. Suresh Iyer',  date:'2026-05-23', qtyIssued:'5',  openingQty:'20',  closingQty:'15' },
    { id: 'iss007', itemId:'itm008', categoryId:'cat003', requestedBy:'Eng. Priya Nair',    approvedBy:'Dr. Kavitha Rao',  date:'2026-05-25', qtyIssued:'4',  openingQty:'6',   closingQty:'2'  },
    { id: 'iss008', itemId:'itm013', categoryId:'cat006', requestedBy:'Eng. Arun Menon',    approvedBy:'Lt. Ramesh Kumar', date:'2026-05-26', qtyIssued:'4',  openingQty:'15',  closingQty:'11' },
  ];
  await writer('issues.csv', ['id','itemId','categoryId','requestedBy','approvedBy','date','qtyIssued','openingQty','closingQty']).writeRecords(issues);
  console.log('✅ issues.csv — 8 issue records');

  console.log(`\n🎉 Seed complete! Data written to: ${DATA_DIR}\n`);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
