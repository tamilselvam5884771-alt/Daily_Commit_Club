-- Migration: Late Commit Coffee Debt Reversal & Idempotent Verification
-- Timezone: Asia/Kolkata (IST)

-- 1. Add penalty_applied column to daily_activity
ALTER TABLE public.daily_activity
ADD COLUMN IF NOT EXISTS penalty_applied BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_daily_activity_penalty_applied 
ON public.daily_activity(penalty_applied) 
WHERE penalty_applied = TRUE;

-- 2. Helper function to recalculate user streaks accurately in database
CREATE OR REPLACE FUNCTION public.recalculate_user_streaks(p_user_id UUID)
RETURNS TABLE (current_streak INT, longest_streak INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE;
  v_yesterday DATE;
  v_curr_streak INT := 0;
  v_longest_streak INT := 0;
  v_temp_streak INT := 0;
  v_prev_date DATE := NULL;
  v_rec RECORD;
  v_has_today BOOLEAN := FALSE;
  v_has_yesterday BOOLEAN := FALSE;
  v_check_date DATE;
BEGIN
  v_today := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;
  v_yesterday := v_today - 1;

  SELECT EXISTS (
    SELECT 1 FROM public.daily_activity 
    WHERE user_id = p_user_id AND activity_date = v_today AND status = 'COMMITTED'
  ) INTO v_has_today;

  SELECT EXISTS (
    SELECT 1 FROM public.daily_activity 
    WHERE user_id = p_user_id AND activity_date = v_yesterday AND status = 'COMMITTED'
  ) INTO v_has_yesterday;

  IF v_has_today THEN
    v_curr_streak := 1;
    v_check_date := v_yesterday;
  ELSIF v_has_yesterday THEN
    v_curr_streak := 1;
    v_check_date := v_yesterday - 1;
  ELSE
    v_curr_streak := 0;
    v_check_date := NULL;
  END IF;

  IF v_check_date IS NOT NULL THEN
    WHILE EXISTS (
      SELECT 1 FROM public.daily_activity 
      WHERE user_id = p_user_id AND activity_date = v_check_date AND status = 'COMMITTED'
    ) LOOP
      v_curr_streak := v_curr_streak + 1;
      v_check_date := v_check_date - 1;
    END LOOP;
  END IF;

  FOR v_rec IN 
    SELECT activity_date 
    FROM public.daily_activity 
    WHERE user_id = p_user_id AND status = 'COMMITTED' 
    ORDER BY activity_date ASC 
  LOOP
    IF v_prev_date IS NULL THEN
      v_temp_streak := 1;
    ELSIF v_rec.activity_date = v_prev_date + 1 THEN
      v_temp_streak := v_temp_streak + 1;
    ELSE
      v_temp_streak := 1;
    END IF;

    IF v_temp_streak > v_longest_streak THEN
      v_longest_streak := v_temp_streak;
    END IF;
    v_prev_date := v_rec.activity_date;
  END LOOP;

  IF v_curr_streak > v_longest_streak THEN
    v_longest_streak := v_curr_streak;
  END IF;

  UPDATE public.profiles
  SET current_streak = v_curr_streak,
      longest_streak = GREATEST(profiles.longest_streak, v_longest_streak),
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT v_curr_streak, v_longest_streak;
END;
$$;

-- 3. Stored Procedure: apply_user_daily_check (Idempotent penalty reversal)
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
  v_penalty_applied BOOLEAN := FALSE;
  v_debt_added BOOLEAN := FALSE;
BEGIN
  PERFORM 1 FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  SELECT status, penalty_applied 
  INTO v_existing_status, v_penalty_applied
  FROM public.daily_activity
  WHERE user_id = p_user_id AND activity_date = p_date
  FOR UPDATE;

  -- 1. Qualifying commit found
  IF p_status = 'COMMITTED' THEN
    IF v_penalty_applied IS TRUE THEN
      UPDATE public.profiles
      SET coffee_debt = GREATEST(0, coffee_debt - 1),
          updated_at = NOW()
      WHERE id = p_user_id;
    END IF;

    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, latest_commit_repo, latest_commit_at, checked_at, penalty_applied
    ) VALUES (
      p_user_id, p_date, 'COMMITTED', p_commit_count, p_repo, p_latest_commit_at, NOW(), FALSE
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET status = 'COMMITTED',
        commit_count = EXCLUDED.commit_count,
        latest_commit_repo = EXCLUDED.latest_commit_repo,
        latest_commit_at = EXCLUDED.latest_commit_at,
        checked_at = NOW(),
        penalty_applied = FALSE;

    PERFORM public.recalculate_user_streaks(p_user_id);

    RETURN QUERY SELECT 'COMMITTED'::TEXT, FALSE;
    RETURN;
  END IF;

  -- 2. MISSED status
  IF p_status = 'MISSED' THEN
    IF v_existing_status = 'COMMITTED' THEN
      RETURN QUERY SELECT 'COMMITTED'::TEXT, FALSE;
      RETURN;
    END IF;

    IF v_penalty_applied IS TRUE THEN
      UPDATE public.daily_activity
      SET checked_at = NOW()
      WHERE user_id = p_user_id AND activity_date = p_date;

      RETURN QUERY SELECT 'MISSED'::TEXT, FALSE;
      RETURN;
    END IF;

    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, checked_at, penalty_applied
    ) VALUES (
      p_user_id, p_date, 'MISSED', 0, NOW(), TRUE
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET status = 'MISSED', checked_at = NOW(), penalty_applied = TRUE;

    UPDATE public.profiles
    SET coffee_debt = coffee_debt + 1,
        current_streak = 0,
        updated_at = NOW()
    WHERE id = p_user_id;

    v_debt_added := TRUE;
    RETURN QUERY SELECT 'MISSED'::TEXT, TRUE;
    RETURN;
  END IF;

  -- 3. PENDING status
  IF p_status = 'PENDING' THEN
    IF v_existing_status = 'COMMITTED' THEN
      RETURN QUERY SELECT 'COMMITTED'::TEXT, FALSE;
      RETURN;
    END IF;

    IF v_existing_status = 'MISSED' THEN
      UPDATE public.daily_activity
      SET checked_at = NOW()
      WHERE user_id = p_user_id AND activity_date = p_date;

      RETURN QUERY SELECT 'MISSED'::TEXT, FALSE;
      RETURN;
    END IF;

    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, checked_at, penalty_applied
    ) VALUES (
      p_user_id, p_date, 'PENDING', 0, NOW(), FALSE
    )
    ON CONFLICT (user_id, activity_date) DO UPDATE
    SET status = 'PENDING', checked_at = NOW()
    WHERE public.daily_activity.status NOT IN ('COMMITTED', 'MISSED');

    RETURN QUERY SELECT 'PENDING'::TEXT, FALSE;
    RETURN;
  END IF;

  -- 4. ERROR status
  IF p_status = 'ERROR' THEN
    IF v_existing_status IN ('COMMITTED', 'MISSED') THEN
      RETURN QUERY SELECT v_existing_status, FALSE;
      RETURN;
    END IF;

    INSERT INTO public.daily_activity (
      user_id, activity_date, status, commit_count, checked_at, penalty_applied
    ) VALUES (
      p_user_id, p_date, 'ERROR', 0, NOW(), FALSE
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

-- 4. Update process_daily_missed_commit_status()
CREATE OR REPLACE FUNCTION public.process_daily_missed_commit_status()
RETURNS TABLE(processed_users integer, missed_count integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_date DATE;
  prof RECORD;
  current_status TEXT;
  is_penalized BOOLEAN;
  total_processed INT := 0;
  total_missed INT := 0;
BEGIN
  today_date := (NOW() AT TIME ZONE 'Asia/Kolkata')::DATE;

  BEGIN
    PERFORM net.http_post(
      url := 'https://mixykqblfvaiualzoblk.supabase.co/functions/v1/process-daily-commit-status',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  FOR prof IN SELECT id, coffee_debt FROM public.profiles WHERE github_username IS NOT NULL LOOP
    total_processed := total_processed + 1;

    SELECT status, penalty_applied INTO current_status, is_penalized
    FROM public.daily_activity
    WHERE user_id = prof.id AND activity_date = today_date;

    IF current_status IS NULL THEN
      INSERT INTO public.daily_activity (user_id, activity_date, status, commit_count, checked_at, penalty_applied)
      VALUES (prof.id, today_date, 'MISSED', 0, NOW(), TRUE)
      ON CONFLICT (user_id, activity_date) DO UPDATE
      SET status = 'MISSED', checked_at = NOW(), penalty_applied = TRUE
      WHERE public.daily_activity.status = 'PENDING';

      IF FOUND THEN
        UPDATE public.profiles
        SET coffee_debt = coffee_debt + 1,
            current_streak = 0,
            updated_at = NOW()
        WHERE id = prof.id;
        total_missed := total_missed + 1;
      END IF;

    ELSIF current_status = 'PENDING' THEN
      UPDATE public.daily_activity
      SET status = 'MISSED', checked_at = NOW(), penalty_applied = TRUE
      WHERE user_id = prof.id AND activity_date = today_date AND status = 'PENDING';

      IF FOUND THEN
        UPDATE public.profiles
        SET coffee_debt = coffee_debt + 1,
            current_streak = 0,
            updated_at = NOW()
        WHERE id = prof.id;
        total_missed := total_missed + 1;
      END IF;
    END IF;

  END LOOP;

  RETURN QUERY SELECT total_processed, total_missed;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recalculate_user_streaks(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.apply_user_daily_check(UUID, DATE, TEXT, INT, TEXT, TIMESTAMPTZ) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.process_daily_missed_commit_status() TO authenticated, anon;
