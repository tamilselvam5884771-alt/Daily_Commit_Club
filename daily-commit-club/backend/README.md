# Daily Commit Club - Backend Foundation

> *"Your GitHub activity keeps your world alive."*

Daily Commit Club is a gamified, production-grade backend engine designed to monitor GitHub activity for a private group of 10 challenge members. Every member must submit at least one qualifying GitHub commit each challenge day to increase their streak, maintain their building health, and progress their world state.

---

## 1. Project Overview

- **Core Concept**: Keep your building alive through daily GitHub commits.
- **Rules**:
  - **Success**: Completing a daily commit increases current streak, preserves building health, and logs completed status.
  - **Failure**: Missing a day resets streak to `0`, damages building health by 40% (destroying at `0%`), incurs a `+1 Coffee Debt` penalty, and dispatches an alert email.
- **Idempotency**: Strict unique constraints and audit checks prevent duplicate activity logging, double streak increments, duplicate coffee debt penalties, and repeated email alerts.

---

## 2. Architecture & Tech Stack

```
daily-commit-club/
    backend/
        src/
            config/           # Database & GitHub OAuth Config
            controllers/      # Thin HTTP request handlers
            models/           # Mongoose schemas (User, Building, DailyActivity, Challenge, Notification)
            routes/           # Express API endpoints
            services/         # Isolated core business & API logic (GitHub, Streak, Building, Email, Notification)
            jobs/             # node-cron scheduled tasks & daily checkers
            middleware/       # JWT auth & error handling middleware
            utils/            # Timezone-aware date helpers & structured logger
            app.js            # Express app configuration
            server.js         # HTTP server entrypoint
        .env.example
        .gitignore
        package.json
```

- **Runtime**: Node.js (ES Modules `"type": "module"`)
- **Web Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: GitHub OAuth & JWT Session tokens
- **Integrations**: GitHub GraphQL & REST API, Nodemailer
- **Scheduler**: `node-cron`
- **Security**: Helmet, CORS, Rate Limiting, Environment Variable isolation

---

## 3. Installation

1. Navigate to the backend directory:
   ```bash
   cd daily-commit-club/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 4. MongoDB Setup

Ensure MongoDB is installed and running locally or configure a cloud connection string.

- **Local MongoDB Connection**: `mongodb://127.0.0.1:27017/daily_commit_club`
- **MongoDB Atlas**: Supply your connection URI in `.env` under `MONGO_URI`.

---

## 5. GitHub OAuth Setup

1. Go to **GitHub Settings -> Developer Settings -> OAuth Apps -> New OAuth App**.
2. Set **Application Name**: `Daily Commit Club`
3. Set **Homepage URL**: `http://localhost:3000`
4. Set **Authorization Callback URL**: `http://localhost:5000/api/auth/github/callback`
5. Copy your **Client ID** and generate a **Client Secret**. Add them to `.env`:
   ```env
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   ```

### OAuth Scopes Chosen & Rationale
- `read:user`: To fetch basic user profile data (GitHub username, avatar, ID, display name).
- `user:email`: To fetch verified email addresses for notification dispatch.
- `repo`: To check qualifying commit history in public and private repositories.

---

## 6. Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=5000
NODE_ENV=development
TIMEZONE=Asia/Kolkata

MONGO_URI=mongodb://127.0.0.1:27017/daily_commit_club

JWT_SECRET=daily_commit_club_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback

FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
EMAIL_FROM="Daily Commit Club <no-reply@dailycommit.club>"

MORNING_REMINDER_CRON=0 9 * * *
LAST_CHANCE_CRON=0 21 * * *
DAILY_CHECK_CRON=59 23 * * *

DAMAGE_PER_MISSED_DAY=40
ALLOW_DEV_ENDPOINTS=true
```

---

## 7. Email SMTP Setup

Configure Nodemailer using Ethereal (for testing), Mailtrap, or SendGrid in `.env`.
The application sends fantasy-themed HTML emails:
- **SUCCESS**: `"🔥 Your building survives another day."`
- **MISSED**: `"☄️ Your building has fallen."`
- **LAST CHANCE**: `"⚠️ Your building is in danger."`

---

## 8. Running the Server

- **Development Mode** (with auto-reload):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

---

## 9. Running Seed Script

Initialize the 10 preset buildings (Amber, Emerald, Burgundy, Sapphire, Violet, Copper, Teal, Crimson, Forest, Indigo):

```bash
npm run seed:buildings
```

*Note: The seed script creates exactly 10 unclaimed building records and creates no users.*

---

## 10. API Endpoints

### Authentication
- `GET /api/auth/github` - Redirects to GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback & JWT token issue
- `GET /api/auth/me` - Get current user profile (Protected)
- `POST /api/auth/logout` - Clear session (Protected)

### Users
- `GET /api/users/me` - Current user details (Protected)
- `PATCH /api/users/me` - Update user profile (Protected)
- `GET /api/users/:id` - Get user profile by ID

### Buildings
- `GET /api/buildings` - List all 10 buildings
- `GET /api/buildings/:id` - Get building details (by ID or Number 1-10)
- `POST /api/buildings/:id/claim` - Claim building ownership (Protected)

### Activity
- `GET /api/activity/me` - Activity history for logged-in user (Protected)
- `GET /api/activity/me/today` - Today's activity status (Protected)
- `GET /api/activity/user/:id` - User activity history

### Challenge & Development Testing
- `GET /api/challenge` - Active challenge metadata
- `GET /api/challenge/status` - Summary overview for all 10 members
- `POST /api/challenge/check-all` - Trigger daily commit check for all users
- `POST /api/challenge/check-user/:userId` - Trigger daily check for specific user
- `POST /api/challenge/test-success/:userId` - Simulate successful commit day
- `POST /api/challenge/test-missed/:userId` - Simulate missed commit day
- `POST /api/notifications/test/:userId` - Send test notification email

---

## 11. Scheduler Explanation

Uses `node-cron` running in `Asia/Kolkata` timezone:
1. **Morning Reminder** (`09:00 AM IST`): Sends morning motivation email to members who haven't committed yet.
2. **Last Chance Warning** (`09:00 PM IST`): Sends critical warning email to members who haven't committed yet.
3. **Daily Check** (`11:59 PM IST`): Evaluates GitHub activity, updates streaks, applies building damage, adds coffee penalties, and sends final notifications.

---

## 12. Daily Commit Logic

Isolated in `githubService.js`:
- Uses GitHub GraphQL API contribution graph and REST endpoints.
- Evaluates total commits logged between `00:00:00` and `23:59:59` IST.
- **GitHub API Failures**: If GitHub API fails or rate-limits, the user is **NOT** marked as missed. The failure is logged and retried.

---

## 13. Streak Logic

Isolated in `streakService.js`:
- **Success**: `currentStreak += 1`, updates `longestStreak` if higher, updates `lastSuccessfulCommitDate`.
- **Missed**: `currentStreak = 0`, `totalMissedDays += 1`, `coffeeDebt += penaltyAmount`.
- Idempotent: Subsequent checks on the same day do not increase streak or debt twice.

---

## 14. Building Health Logic

Isolated in `buildingService.js`:
- Initial Health: `100%`
- Missed Day Damage: `-40%` (configurable via `DAMAGE_PER_MISSED_DAY`)
- When Health reaches `0%`: `destroyed = true`, `destructionCount += 1`.
- Backend only exposes pure state object (`{ health, maxHealth, destroyed }`). Frontend will later animate this state.

---

## 15. Testing Instructions

Run the automated system verification script:

```bash
node src/scripts/testSystem.js
```

This verifies:
- Building seeding
- User creation & single ownership building claims
- Prevention of duplicate building claims
- DailyActivity compound unique index `{ userId: 1, date: 1 }`
- Idempotent streak increments & coffee debt calculation
- Email notification deduplication
