# 🚀 Daily Commit Club — Full-Stack Deployment Guide

> **Your GitHub activity keeps your world alive.**

Daily Commit Club is a gamified full-stack web application. Members register their GitHub account, claim 3D isometric city buildings, and keep their streak alive through real GitHub commits.

---

## 🏗️ Architecture Overview

- **Frontend**: React 18, Vite, TailwindCSS v4, Framer Motion, GSAP, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Octokit GitHub GraphQL/REST API, JWT Auth, Nodemailer, Node-Cron & Serverless Cron endpoints.
- **Database**: MongoDB Atlas / Self-hosted MongoDB.

---

## ⚡ Project Status Audit

- ✅ **Backend API**: All routes (`auth`, `users`, `github`, `activity`, `challenge`, `buildings`, `cron`, `dev`) mounted and verified.
- ✅ **Database Connection**: Configured for both `MONGODB_URI` and `MONGO_URI` with auto-seeding for building presets.
- ✅ **Cookie & JWT Authentication**: `cookie-parser` and `Bearer` token authorization fully integrated.
- ✅ **Frontend Build**: Vite build configured and optimized for SPA routing (`dist` build verified clean).
- ✅ **Serverless Support**: Serverless cron endpoints (`/api/cron/daily-check`, `/api/cron/morning-reminders`, `/api/cron/last-chance-reminders`) ready for Vercel Cron.
- ✅ **Containerization**: `Dockerfile` for backend & frontend + `docker-compose.yml` configured.

---

## 🌐 Deployment Options

### Option 1: Vercel (Monorepo Single-Click Deployment) — Recommended

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the project (`daily-commit-club`).
3. Set the Root Directory to `./` (or leave default).
4. Configure Environment Variables in Vercel settings:
   - `MONGODB_URI`: Your MongoDB Atlas Connection String (`mongodb+srv://...`)
   - `JWT_SECRET`: A strong random secret key
   - `TIMEZONE`: `Asia/Kolkata` (or your local timezone)
   - `FRONTEND_URL`: `https://your-app.vercel.app`
5. Click **Deploy**. Vercel will automatically build the frontend and serve backend API functions via `backend/api/index.js` and trigger crons automatically.

---

### Option 2: Render / Railway / Fly.io

1. **Deploy Backend (Node.js Web Service)**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Root Directory: `daily-commit-club/backend`
   - Environment Variables:
     - `MONGODB_URI`: `mongodb+srv://...`
     - `JWT_SECRET`: `your_jwt_secret`
     - `FRONTEND_URL`: `https://your-frontend-domain.com`
     - `PORT`: `5000`

2. **Deploy Frontend (Static Site / Vercel / Netlify)**:
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Root Directory: `daily-commit-club/frontend`
   - Environment Variables:
     - `VITE_API_URL`: `https://your-backend-api-domain.com`

---

### Option 3: Docker & Docker Compose (VPS / Self-Hosted)

Run the entire stack (MongoDB + Backend + Frontend) locally or on a VPS with a single command:

```bash
docker-compose up -d --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000/api`
- MongoDB: `mongodb://localhost:27017`

---

## ⚙️ Environment Variables Reference

| Variable | Description | Default |
| --- | --- | --- |
| `MONGODB_URI` / `MONGO_URI` | MongoDB Connection URI | `mongodb://127.0.0.1:27017/daily_commit_club` |
| `JWT_SECRET` | Secret key for JWT signing | `daily_commit_club_super_secret_jwt_key_2026` |
| `JWT_EXPIRES_IN` | Token expiration period | `7d` |
| `FRONTEND_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `TIMEZONE` | Timezone for streak calculations | `Asia/Kolkata` |
| `CRON_SECRET` | Optional secret for serverless cron routes | None |

---

## 🛠️ Verification Commands

```bash
# Verify Frontend Build
cd frontend
npm run build

# Verify Backend
cd backend
npm start
```
