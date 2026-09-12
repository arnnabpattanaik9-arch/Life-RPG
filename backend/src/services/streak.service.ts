export function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(aKey: string, bKey: string): number {
  const a = new Date(aKey + 'T00:00:00');
  const b = new Date(bKey + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function computeStreaks(history: string[]): {
  current: number;
  longest: number;
} {
  if (history.length === 0) return { current: 0, longest: 0 };
  const sorted = [...new Set(history)].sort();

  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  const today = todayKey();
  const last = sorted[sorted.length - 1];
  const gapFromToday = daysBetween(last, today);

  // Streak is alive if the most recent activity was today or yesterday
  let current = 0;
  if (gapFromToday <= 1) {
    current = 1;
    for (let i = sorted.length - 1; i > 0; i--) {
      if (daysBetween(sorted[i - 1], sorted[i]) === 1) {
        current += 1;
      } else {
        break;
      }
    }
  }

  return { current, longest };
}
