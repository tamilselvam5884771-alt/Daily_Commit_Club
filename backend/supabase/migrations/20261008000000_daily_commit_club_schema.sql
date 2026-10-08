-- Daily Commit Club Production Database Schema Migration
-- Timezone: Asia/Kolkata (IST)

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  github_url TEXT,
  github_username TEXT UNIQUE NOT NULL,
  github_avatar_url TEXT,
  internal_email TEXT,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  coffee_debt INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. DAILY ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('COMMITTED', 'PENDING', 'MISSED', 'ERROR')),
  commit_count INTEGER NOT NULL DEFAULT 0,
  latest_commit_at TIMESTAMPTZ,
  latest_commit_repo TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_activity_date UNIQUE (user_id, activity_date)
);

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'DAILY_COMMIT_REMINDER',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON public.daily_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_profiles_github_username ON public.profiles(github_username);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON public.notifications(user_id, status);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow read access to profiles for authenticated users') THEN
    CREATE POLICY "Allow read access to profiles for authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow users to insert their own profile') THEN
    CREATE POLICY "Allow users to insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow users to update their own profile') THEN
    CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_activity' AND policyname = 'Allow read access to daily_activity for authenticated users') THEN
    CREATE POLICY "Allow read access to daily_activity for authenticated users" ON public.daily_activity FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_activity' AND policyname = 'Allow users to insert update daily activity') THEN
    CREATE POLICY "Allow users to insert update daily activity" ON public.daily_activity FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Allow read access to own notifications') THEN
    CREATE POLICY "Allow read access to own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

-- RPC 1: RESOLVE INTERNAL LOGIN EMAIL BY NAME / USERNAME
CREATE OR REPLACE FUNCTION public.get_login_email(user_identifier TEXT)
RETURNS TABLE (email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.internal_email
  FROM public.profiles p
  WHERE LOWER(p.name) = LOWER(user_identifier)
     OR LOWER(p.github_username) = LOWER(user_identifier)
  LIMIT 1;
END;
$$;

-- RPC 2: IDEMPOTENT SERVER-SIDE CHECK APPLICATION
CREATE OR REPLACE FUNCTION public.apply_user_daily_check(
  p_user_id UUID,
  p_date DATE,
  p_status TEXT,
  p_commit_count INT,
  p_repo TEXT,
  p_latest_commit_at TIMESTAMPTZ
)
RETURNS TABLE (updated_status TEXT, debt_incremented BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_status TEXT;
  v_debt_added BOOLEAN := FALSE;
BEGIN
  SELECT status INTO v_existing_status
  FROM public.daily_activity
  WHERE user_id = p_user_id AND activity_date = p_date;

  IF v_existing_status = 'COMMITTED' THEN
    RETURN QUERY SELECT 'COMMITTED'::TEXT, FALSE;
    RETURN;
  END IF;

  IF v_existing_status = 'MISSED' THEN
    RETURN QUERY SELECT 'MISSED'::TEXT, FALSE;
    RETURN;
  END IF;

  IF p_status = 'COMMITTED' THEN
    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, latest_commit_repo, latest_commit_at, checked_at
    ) VALUES (
      p_user_id, p_date, 'COMMITTED', p_commit_count, p_repo, p_latest_commit_at, NOW()
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET status = 'COMMITTED',
        commit_count = EXCLUDED.commit_count,
        latest_commit_repo = EXCLUDED.latest_commit_repo,
        latest_commit_at = EXCLUDED.latest_commit_at,
        checked_at = NOW();

    RETURN QUERY SELECT 'COMMITTED'::TEXT, FALSE;
    RETURN;
  END IF;

  IF p_status = 'MISSED' THEN
    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, checked_at
    ) VALUES (
      p_user_id, p_date, 'MISSED', 0, NOW()
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET status = 'MISSED', checked_at = NOW();

    UPDATE public.profiles
    SET coffee_debt = coffee_debt + 1,
        current_streak = 0,
        updated_at = NOW()
    WHERE id = p_user_id;

    v_debt_added := TRUE;
    RETURN QUERY SELECT 'MISSED'::TEXT, TRUE;
    RETURN;
  END IF;

  IF p_status = 'ERROR' THEN
    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, checked_at
    ) VALUES (
      p_user_id, p_date, 'ERROR', 0, NOW()
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET status = 'ERROR', checked_at = NOW()
    WHERE public.daily_activity.status NOT IN ('COMMITTED', 'MISSED');

    RETURN QUERY SELECT 'ERROR'::TEXT, FALSE;
    RETURN;
  END IF;

  RETURN QUERY SELECT COALESCE(v_existing_status, 'PENDING')::TEXT, FALSE;
END;
$$;

-- RPC 3: 7:30 PM IST DAILY REMINDER GENERATION
CREATE OR REPLACE FUNCTION public.generate_daily_commit_reminders()
RETURNS TABLE (reminders_sent INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE;
  prof RECORD;
  already_reminded BOOLEAN;
  sent_count INT := 0;
BEGIN
  today_date := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;

  FOR prof IN 
    SELECT p.id, p.name 
    FROM public.profiles p
    LEFT JOIN public.daily_activity da ON da.user_id = p.id AND da.activity_date = today_date
    WHERE da.status IS NULL OR da.status = 'PENDING'
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.notifications 
      WHERE user_id = prof.id 
        AND type = 'DAILY_COMMIT_REMINDER' 
        AND (created_at AT TIME ZONE 'Asia/Kolkata')::DATE = today_date
    ) INTO already_reminded;

    IF NOT already_reminded THEN
      INSERT INTO public.notifications (
        user_id, type, title, message, scheduled_for, sent_at, status
      ) VALUES (
        prof.id,
        'DAILY_COMMIT_REMINDER',
        '☕ Daily Commit Club Reminder',
        'You haven''t committed today yet. Push a commit before 8:00 PM IST to avoid coffee debt.',
        NOW(),
        NULL,
        'PENDING'
      );
      sent_count := sent_count + 1;
    END IF;

  END LOOP;

  RETURN QUERY SELECT sent_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_login_email(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.apply_user_daily_check(UUID, DATE, TEXT, INT, TEXT, TIMESTAMPTZ) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.generate_daily_commit_reminders() TO authenticated, anon;

-- 4. AUTH TRIGGERS FOR AUTO EMAIL CONFIRMATION AND PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_user_before()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  NEW.email_confirmed_at := NOW();
  NEW.confirmed_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_after()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_name TEXT;
  v_username TEXT;
  v_url TEXT;
  v_avatar TEXT;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Member');
  v_username := COALESCE(NEW.raw_user_meta_data->>'github_username', SPLIT_PART(NEW.email, '@', 1));
  v_url := COALESCE(NEW.raw_user_meta_data->>'github_url', 'https://github.com/' || v_username);
  v_avatar := COALESCE(NEW.raw_user_meta_data->>'github_avatar_url', 'https://github.com/' || v_username || '.png');

  INSERT INTO public.profiles (
    id,
    name,
    github_url,
    github_username,
    github_avatar_url,
    internal_email,
    current_streak,
    longest_streak,
    coffee_debt
  ) VALUES (
    NEW.id,
    v_name,
    v_url,
    v_username,
    v_avatar,
    NEW.email,
    0,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    github_url = EXCLUDED.github_url,
    github_username = EXCLUDED.github_username,
    github_avatar_url = EXCLUDED.github_avatar_url,
    internal_email = EXCLUDED.internal_email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_before ON auth.users;
CREATE TRIGGER on_auth_user_created_before
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_before();

DROP TRIGGER IF EXISTS on_auth_user_created_after ON auth.users;
CREATE TRIGGER on_auth_user_created_after
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_after();

