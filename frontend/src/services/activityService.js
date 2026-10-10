import { supabase } from '../lib/supabase';
import { getKolkataDateString, getKolkataDaysAgoString } from '../utils/dateUtils';

/**
 * Calculates current and longest streaks from user's historical daily activity
 * @param {string} userId 
 * @returns {Promise<{ currentStreak: number, longestStreak: number }>}
 */
export const calculateUserStreaks = async (userId) => {
  if (!userId) return { currentStreak: 0, longestStreak: 0 };

  try {
    // Fetch all COMMITTED daily_activity records for user, ordered by date descending
    const { data: records, error } = await supabase
      .from('daily_activity')
      .select('activity_date, status')
      .eq('user_id', userId)
      .eq('status', 'COMMITTED')
      .order('activity_date', { ascending: false });

    if (error || !records || records.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Set of committed dates
    const committedDates = new Set(records.map(r => r.activity_date));

    const todayStr = getKolkataDateString();
    const yesterdayStr = getKolkataDaysAgoString(1);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    // If today is committed, start counting from today. Otherwise start from yesterday.
    if (committedDates.has(todayStr)) {
      // Today is committed
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (committedDates.has(yesterdayStr)) {
      // Today is still pending/not committed yet, but yesterday was committed
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Neither today nor yesterday was committed
      currentStreak = 0;
    }

    if (currentStreak > 0 || committedDates.has(yesterdayStr)) {
      // Loop backwards day by day as long as dates match
      while (true) {
        const dateStr = getKolkataDateString(checkDate);
        if (committedDates.has(dateStr)) {
          if (!committedDates.has(todayStr) && currentStreak === 0) {
            // First hit on yesterday when today is pending
            currentStreak = 1;
          } else if (committedDates.has(todayStr)) {
            // Increment for preceding days
            currentStreak++;
          } else {
            currentStreak++;
          }
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak across all history
    // Convert committed dates to sorted array ascending
    const sortedDates = Array.from(committedDates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDateObj = null;

    for (const dStr of sortedDates) {
      const currentDateObj = new Date(dStr);
      if (!prevDateObj) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(currentDateObj - prevDateObj);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDateObj = currentDateObj;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    return { currentStreak, longestStreak };

  } catch (err) {
    console.error('Error calculating streaks:', err);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * Saves or updates today's GitHub activity into daily_activity table
 * and updates user profile streaks.
 * @param {string} userId 
 * @param {{ status: string, commitCount: number, latestCommit: object|null }} ghResult 
 */
export const syncTodayActivity = async (userId, ghResult) => {
  if (!userId) return null;

  const todayStr = getKolkataDateString();

  try {
    let effectiveStatus = ghResult.status;

    // Apply check via idempotent RPC which handles late commit debt reversal
    if (ghResult.status === 'COMMITTED' || ghResult.status === 'PENDING') {
      const { data: rpcData, error: rpcError } = await supabase.rpc('apply_user_daily_check', {
        p_user_id: userId,
        p_date: todayStr,
        p_status: ghResult.status,
        p_commit_count: ghResult.commitCount || 0,
        p_repo: ghResult.latestCommit?.repo || null,
        p_latest_commit_at: ghResult.latestCommit?.timestamp || null
      });

      if (rpcError) {
        console.error('Error applying daily check via RPC:', rpcError.message);
        // Fallback upsert
        const checkedAt = new Date().toISOString();
        await supabase
          .from('daily_activity')
          .upsert({
            user_id: userId,
            activity_date: todayStr,
            status: ghResult.status,
            commit_count: ghResult.commitCount || 0,
            latest_commit_at: ghResult.latestCommit?.timestamp || null,
            latest_commit_repo: ghResult.latestCommit?.repo || null,
            checked_at: checkedAt
          }, { onConflict: 'user_id, activity_date' });
      } else if (rpcData && rpcData.length > 0) {
        effectiveStatus = rpcData[0].updated_status || ghResult.status;
      }
    }

    // Recalculate streaks and update profiles
    const streaks = await calculateUserStreaks(userId);

    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        current_streak: streaks.currentStreak,
        longest_streak: streaks.longestStreak,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileUpdateError) {
      console.error('Error updating profile streaks:', profileUpdateError.message);
    }

    return { ...streaks, effectiveStatus };

  } catch (err) {
    console.error('Exception syncing today activity:', err);
    return null;
  }
};
