/**
 * Dynamic Character Dialogue Generator
 * Creates contextual speech bubble text based on streak, today's status, building health, and coffee debt.
 */

export const generateCharacterDialogue = (user, building, todayStatus) => {
  if (!user || user.githubUsername === 'Unclaimed') {
    return 'This structure is waiting for a master...';
  }

  const streak = user.currentStreak || 0;
  const health = building?.health ?? 100;
  const destroyed = building?.destroyed || health === 0;

  if (destroyed) {
    return 'Bro... I missed the commit. 😭 My building collapsed!';
  }

  if (health <= 25) {
    return "Umm... my building isn't looking too good... ⚠️";
  }

  if (todayStatus === 'completed') {
    if (streak >= 30) return `Day ${streak} already! Legendary status unlocked 🔥🏆`;
    if (streak >= 14) return `Day ${streak} streak! We're cooking! 🔥`;
    if (streak >= 7) return `7+ Days strong! Realm is safe 🔥`;
    return 'Hey! I survived another day! 🔥';
  }

  if (todayStatus === 'missed') {
    return 'Oh no! Penalty incurred today... ☕';
  }

  // Pending status
  if (streak >= 10) return `Maintaining a ${streak} day streak. Committing soon!`;
  return `Hii! I'm @${user.githubUsername} 👋 Push a commit today!`;
};
