import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://mixykqblfvaiualzoblk.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1peHlrcWJsZnZhaXVhbHpvYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NjA5MjksImV4cCI6MjEwMTMzNjkyOX0.0la8p-bUMPd_1Va1_ZsSuDKpMxdefWqfczTZqRxSr-U";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in Asia/Kolkata
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const formatter = new Intl.DateTimeFormat('en-CA', options as any);
    const todayKolkataStr = formatter.format(new Date());

    // 1. Fetch only Daily Commit Club profiles (must have valid github_username)
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, github_username, name')
      .not('github_username', 'is', null);

    if (profErr) throw profErr;

    let processedCount = 0;
    let committedCount = 0;
    let missedCount = 0;
    let errorCount = 0;
    let reversedCount = 0;

    for (const user of (profiles || [])) {
      processedCount++;
      const username = user.github_username?.trim();

      if (!username || username === 'https:' || username.startsWith('http')) {
        continue;
      }

      // Check existing status for today
      const { data: existingAct } = await supabase
        .from('daily_activity')
        .select('status, penalty_applied')
        .eq('user_id', user.id)
        .eq('activity_date', todayKolkataStr)
        .maybeSingle();

      const existingStatus = existingAct?.status;
      // If already COMMITTED today, commitment is already fulfilled for this date
      if (existingStatus === 'COMMITTED') {
        committedCount++;
        continue;
      }

      try {
        const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/events/public`, {
          headers: { 
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'DailyCommitClub-VerificationBot'
          }
        });

        if (!ghRes.ok) {
          // GitHub API failure (rate limit 403/429, network error, etc.) -> mark ERROR, NEVER penalty
          await supabase.rpc('apply_user_daily_check', {
            p_user_id: user.id,
            p_date: todayKolkataStr,
            p_status: 'ERROR',
            p_commit_count: 0,
            p_repo: null,
            p_latest_commit_at: null
          });
          errorCount++;
          continue;
        }

        const events = await ghRes.json();
        let todayCommits = 0;
        let latestCommit = null;

        if (Array.isArray(events)) {
          for (const ev of events) {
            if (ev.type === 'PushEvent' && ev.created_at) {
              const evDateStr = formatter.format(new Date(ev.created_at));
              if (evDateStr === todayKolkataStr) {
                const commits = ev.payload?.commits || [];
                const numCommits = commits.length > 0 ? commits.length : (ev.payload?.size || 1);
                todayCommits += numCommits;
                if (!latestCommit) {
                  latestCommit = {
                    repo: ev.repo?.name || 'GitHub Repo',
                    timestamp: ev.created_at
                  };
                }
              }
            }
          }
        }

        if (todayCommits > 0) {
          const wasPenalized = existingAct?.penalty_applied === true;
          await supabase.rpc('apply_user_daily_check', {
            p_user_id: user.id,
            p_date: todayKolkataStr,
            p_status: 'COMMITTED',
            p_commit_count: todayCommits,
            p_repo: latestCommit?.repo || null,
            p_latest_commit_at: latestCommit?.timestamp || null
          });
          committedCount++;
          if (wasPenalized) {
            reversedCount++;
          }
        } else {
          // Confirmed 0 commits -> mark MISSED (applies or retains idempotent penalty)
          await supabase.rpc('apply_user_daily_check', {
            p_user_id: user.id,
            p_date: todayKolkataStr,
            p_status: 'MISSED',
            p_commit_count: 0,
            p_repo: null,
            p_latest_commit_at: null
          });
          missedCount++;
        }

      } catch (err) {
        console.error(`Error checking GitHub for ${username}:`, err);
        await supabase.rpc('apply_user_daily_check', {
          p_user_id: user.id,
          p_date: todayKolkataStr,
          p_status: 'ERROR',
          p_commit_count: 0,
          p_repo: null,
          p_latest_commit_at: null
        });
        errorCount++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      todayDate: todayKolkataStr,
      processedCount,
      committedCount,
      missedCount,
      errorCount,
      reversedCount
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
