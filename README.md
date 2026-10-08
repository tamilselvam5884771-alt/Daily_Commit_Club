# Daily Commit Club

A private developer productivity application for tracking daily GitHub commitments among friends and club members.

**Core Rule:** Miss a daily GitHub commitment before 8:00 PM IST, owe coffee ☕

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Lucide Icons, React Router v7
- **Backend Platform:** Supabase (Auth, PostgreSQL, Row Level Security, Edge Functions)
- **Timezone Support:** `Asia/Kolkata` (IST)
- **Scheduling:** `pg_cron` (7:30 PM IST reminders, 8:00 PM IST missed-day processing)
- **Integration:** GitHub Public API

---

## 📁 Repository Structure

```text
Daily_Commit Club/
├── frontend/             # React + Vite application
│   ├── src/
│   │   ├── components/   # UI Layout & Navbar
│   │   ├── context/      # Supabase Auth Provider
│   │   ├── lib/          # Supabase Client
│   │   ├── pages/        # Auth, Dashboard, Members, Coffee pages
│   │   ├── services/     # GitHub API & Activity persistence
│   │   └── utils/        # Asia/Kolkata timezone utilities
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/              # Supabase backend infrastructure
│   ├── supabase/
│   │   ├── functions/    # Edge Function (process-daily-commit-status)
│   │   └── migrations/   # SQL DDL & RPC Procedures
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development Setup

### 1. Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The application will run on `http://localhost:3000`.

### 2. Frontend Production Build

```bash
cd frontend
npm run build
```

---

## 🔒 Environment Variables

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_SUPABASE_URL=https://mixykqblfvaiualzoblk.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*Note: Frontend environment variables must only contain public client keys (`VITE_`). Server keys are kept strictly in backend environment configuration.*
