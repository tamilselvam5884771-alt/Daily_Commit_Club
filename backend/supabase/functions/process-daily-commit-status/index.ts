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

    // 1. Fetch Daily Commit Club profiles with emails
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, github_username, name, email, internal_email')
      .not('github_username', 'is', null);

    if (profErr) throw profErr;

    let processedCount = 0;
    let committedCount = 0;
    let missedCount = 0;
    let errorCount = 0;
    let reversedCount = 0;
    let emailsSent = 0;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");

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

          // Send 8:00 PM email notification to real user email
          const recipientEmail = user.email || user.internal_email;
          if (recipientEmail && recipientEmail.includes('@')) {
            try {
              // 1. Record notification in notifications table
              await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'MISSED_COMMIT_REMINDER',
                title: '☕ Daily Commit Club: 8:00 PM Commit Alert',
                message: `Hi ${user.name || 'Member'}, zero commits were detected for today (${todayKolkataStr}) before the 8:00 PM IST evaluation cutoff. A provisional coffee debt of 1 cup has been added. You can still push a commit before 11:59 PM IST tonight to automatically reverse this debt!`,
                scheduled_for: new Date().toISOString(),
                sent_at: new Date().toISOString(),
                status: 'SENT'
              });

              // 2. Dispatch email via Resend if API key is configured
              if (resendApiKey) {
                const emailRes = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    from: 'Daily Commit Club <onboarding@resend.dev>',
                    to: [recipientEmail],
                    subject: '☕ Daily Commit Club: 8:00 PM Commit Deadline Alert',
                    html: `
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #030f0a; color: #ecfdf5; padding: 24px; border-radius: 8px; max-width: 600px;">
                        <h2 style="color: #f87171; margin-top: 0;">☕ Daily Commit Club — 8:00 PM IST Alert</h2>
                        <p style="font-size: 16px;">Hi <strong>${user.name || 'Member'}</strong>,</p>
                        <p>No commits were detected for your GitHub account (<strong>@${username}</strong>) today (<strong>${todayKolkataStr}</strong>) by the 8:00 PM IST evaluation cutoff.</p>
                        <div style="background: #1c0a0a; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0; border-radius: 4px;">
                          <p style="margin: 0; color: #fca5a5; font-weight: bold;">Provisional Coffee Debt: +1 Cup ☕</p>
                        </div>
                        <p style="color: #34d399; font-size: 15px;">
                          <strong>Late Commit Rule:</strong> You have until <strong>11:59 PM IST</strong> tonight! Push at least 1 commit before midnight and sync your dashboard to automatically reverse this coffee debt.
                        </p>
                        <hr style="border: 0; border-top: 1px solid #0d422c; margin: 20px 0;" />
                        <p style="color: #86efac; font-size: 12px; margin: 0;">Daily Commit Club • Asia/Kolkata (IST)</p>
                      </div>
                    `
                  })
                });
                if (emailRes.ok) {
                  emailsSent++;
                }
              }
            } catch (mailErr) {
              console.error(`Error sending email to ${recipientEmail}:`, mailErr);
            }
          }
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
      reversedCount,
      emailsSent
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
