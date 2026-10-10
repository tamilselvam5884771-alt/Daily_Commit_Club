# Daily Commit Club — Backend Infrastructure

This directory contains server-side components for **Daily Commit Club**:

## Architecture Overview

1. **Database Schema & Migrations (`supabase/migrations/`)**
   - PostgreSQL schema definitions for `profiles`, `daily_activity`, and `notifications`.
   - Row Level Security (RLS) policies ensuring data isolation.
   - Stored Procedure RPCs:
     - `get_login_email`: Resolves user internal auth email for Name/Username + Password sign-in.
     - `apply_user_daily_check`: Idempotent database procedure for recording daily status (`COMMITTED`, `PENDING`, `MISSED`, `ERROR`) and updating coffee debt.
     - `generate_daily_commit_reminders`: Idempotent procedure generating 7:30 PM IST commit reminders.

2. **Supabase Edge Functions (`supabase/functions/`)**
   - `process-daily-commit-status`: Deno/TypeScript function executed at 8:00 PM IST (14:30 UTC).
   - Verifies public GitHub events for all registered club members independently of client browser activity.
   - Server-side credentials (service role keys / API tokens) remain strictly server-side.

3. **Scheduled Execution (`pg_cron`)**
   - **7:30 PM IST (14:00 UTC):** `0 14 * * *` → Executes `generate_daily_commit_reminders()`.
   - **8:00 PM IST (14:30 UTC):** `30 14 * * *` → Executes `process_daily_missed_commit_status()` (invokes `process-daily-commit-status` Edge Function for server-side verification and records provisional, reversible penalties).
   - **11:55 PM IST (18:25 UTC):** `25 18 * * *` → Executes end-of-day final verification. Late commits (up to 11:59 PM IST) reverse penalties idempotently.
