/**
 * Timezone utilities for Daily Commit Club
 * Primary Timezone: Asia/Kolkata (IST)
 */

/**
 * Returns today's date in YYYY-MM-DD format according to Asia/Kolkata timezone
 * @param {Date} [dateObj=new Date()]
 * @returns {string} Date formatted as 'YYYY-MM-DD'
 */
export const getKolkataDateString = (dateObj = new Date()) => {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD format
  return formatter.format(dateObj);
};

/**
 * Formats a date into a human readable string in Asia/Kolkata timezone
 * @param {Date|string} date
 * @returns {string} e.g. "Thursday, Oct 8, 2026"
 */
export const formatKolkataDisplayDate = (date = new Date()) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

/**
 * Formats an ISO date/timestamp to Kolkata local time string
 * @param {string|Date} isoString 
 * @returns {string} e.g. "04:30 PM IST"
 */
export const formatKolkataTime = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
  return `${timeStr} IST`;
};

/**
 * Calculates date string for N days ago in Asia/Kolkata timezone
 * @param {number} daysAgo 
 * @returns {string} YYYY-MM-DD
 */
export const getKolkataDaysAgoString = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getKolkataDateString(d);
};
