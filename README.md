# URSC Store Management System

An internal inventory management system built for the **U R Rao Satellite Centre (URSC), ISRO, Bengaluru** — part of the Department of Space, Government of India.

🔗 **Live Demo:** [isro-inventory.vercel.app](https://isro-inventory.vercel.app)

---

## Overview

URSC operates a large store of components, equipment, and materials used across satellite and space research projects. This system digitises and streamlines the entire store lifecycle — from item entry and categorisation to issue requests, approvals, and automated backups — replacing manual paper-based processes.

---

## Features

- **Item Management** — Add, update, and track inventory items with category classification
- **Stock Entries** — Record incoming stock with quantity and metadata
- **Issue Requests** — Staff can raise requests for items; store managers review and approve/reject
- **Issue Tracking** — Full history of issued items per user and department
- **User Management** — Role-based access for store managers and requestors
- **Automated Backups** — Periodic CSV snapshots of all data with a backup log for auditability
- **Persistent CSV Storage** — Lightweight file-based data store; no external database dependency

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js (Express) |
| Storage | CSV-based flat file persistence |
| Deployment | Vercel (frontend) |

---

## Data Model

The system manages six core entities:

- `items` — Inventory items with stock levels
- `categories` — Item classification
- `entries` — Incoming stock records
- `issues` — Approved and completed issues
- `issue_requests` — Pending issue requests from users
- `users` — System users with roles

All data is stored as CSV files with automated backups written to the `ursc-store-data/backups/` directory.

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm

### Backend

```bash
cd backend
npm install
node seed.js       # seed initial data
node server.js     # start server (default: http://localhost:3000)
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # start dev server (default: http://localhost:5173)
```

### Environment

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:3000
```

---

## Project Structure

```
ISRO-inventory/
├── backend/
│   ├── server.js           # Express API server
│   ├── seed.js             # Initial data seeder
│   └── ursc-store-data/    # CSV data store + backups
└── frontend/
    ├── src/                # React components and pages
    ├── public/
    └── vite.config.js
```

---

## Built By

Developed by Katari Abhiram as a part of a software internship/project at URSC, ISRO Bengaluru.
