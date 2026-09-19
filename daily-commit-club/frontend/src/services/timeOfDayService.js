/**
 * Time-of-Day Service for Daily Commit Club World
 * Determines current realm lighting & sky atmosphere:
 * - Morning (06:00 - 11:59): Soft warm sunrise
 * - Afternoon (12:00 - 16:59): Bright clear atmosphere
 * - Evening (17:00 - 20:59): Golden sunset & glowing windows
 * - Night (21:00 - 05:59): Deep cosmic sky, stars, moon, glowing windows
 */

export const getTimeOfDay = (date = new Date()) => {
  const hours = date.getHours();
  if (hours >= 6 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 17) return 'afternoon';
  if (hours >= 17 && hours < 21) return 'evening';
  return 'night';
};

export const TIME_OF_DAY_STYLES = {
  morning: {
    gradient: 'from-[#0d1627] via-[#1a2536] to-[#291b2c]',
    skyTint: 'rgba(251, 146, 60, 0.1)',
    windowGlowOpacity: 0.5,
    showMoon: false,
    sunOpacity: 0.6
  },
  afternoon: {
    gradient: 'from-[#0b1329] via-[#101b38] to-[#0f172a]',
    skyTint: 'rgba(56, 189, 248, 0.05)',
    windowGlowOpacity: 0.3,
    showMoon: false,
    sunOpacity: 0.9
  },
  evening: {
    gradient: 'from-[#170e2b] via-[#241333] to-[#0d1021]',
    skyTint: 'rgba(244, 63, 94, 0.15)',
    windowGlowOpacity: 0.8,
    showMoon: false,
    sunOpacity: 0.4
  },
  night: {
    gradient: 'from-[#050811] via-[#070b18] to-[#04060d]',
    skyTint: 'rgba(99, 102, 241, 0.15)',
    windowGlowOpacity: 1.0,
    showMoon: true,
    sunOpacity: 0
  }
};
