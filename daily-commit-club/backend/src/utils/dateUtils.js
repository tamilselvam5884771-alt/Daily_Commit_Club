/**
 * Timezone-aware Date Utility functions for Daily Commit Club
 * Challenge Timezone: Asia/Kolkata
 */

const DEFAULT_TIMEZONE = process.env.TIMEZONE || 'Asia/Kolkata';

/**
 * Returns today's challenge date formatted as YYYY-MM-DD in Asia/Kolkata.
 * @param {string} timezone 
 * @returns {string} e.g. "2026-09-19"
 */
export const getChallengeDate = (timezone = DEFAULT_TIMEZONE) => {
  return getDateString(new Date(), timezone);
};

/**
 * Alias for getChallengeDate for backwards compatibility
 */
export const getTodayDateString = (timezone = DEFAULT_TIMEZONE) => {
  return getChallengeDate(timezone);
};

/**
 * Formats a Date object as YYYY-MM-DD in the specified timezone.
 * @param {Date|string} date 
 * @param {string} timezone 
 * @returns {string}
 */
export const getDateString = (date = new Date(), timezone = DEFAULT_TIMEZONE) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(d);
};

/**
 * Checks if a given YYYY-MM-DD date string represents "today" in the challenge timezone
 */
export const isToday = (dateStr, timezone = DEFAULT_TIMEZONE) => {
  return dateStr === getChallengeDate(timezone);
};

/**
 * Returns the ISO string corresponding to start of day (00:00:00.000 IST)
 * @param {string} dateStr YYYY-MM-DD
 */
export const getChallengeDayStart = (dateStr = getChallengeDate()) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  // IST is UTC+5:30 -> 00:00 IST = 18:30 UTC previous day
  const localUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return new Date(localUTC.getTime() - (5.5 * 60 * 60 * 1000)).toISOString();
};

/**
 * Returns the ISO string corresponding to end of day (23:59:59.999 IST)
 * @param {string} dateStr YYYY-MM-DD
 */
export const getChallengeDayEnd = (dateStr = getChallengeDate()) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  // IST is UTC+5:30 -> 23:59:59.999 IST = 18:29:59.999 UTC current day
  const localUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return new Date(localUTC.getTime() - (5.5 * 60 * 60 * 1000)).toISOString();
};

/**
 * Bounds object helper for backward compatibility
 */
export const getDayISOBounds = (dateStr = getChallengeDate()) => {
  return {
    startISO: getChallengeDayStart(dateStr),
    endISO: getChallengeDayEnd(dateStr)
  };
};

/**
 * Checks if a given date string is yesterday relative to another date string
 */
export const isYesterday = (dateStr, relativeToDateStr) => {
  const d1 = new Date(`${dateStr}T00:00:00Z`);
  const d2 = new Date(`${relativeToDateStr}T00:00:00Z`);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays === 1;
};
