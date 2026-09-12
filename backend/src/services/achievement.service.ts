import { ACHIEVEMENTS, AchievementDef } from '../data/catalog.js';
import { AchievementItem } from '../types/index.js';

export function evaluateAchievements(
  stats: {
    level: number;
    attributes: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
  },
  hasAnyCompletion: boolean,
  alreadyUnlockedIds: Set<string>
): AchievementItem[] {
  const newlyUnlocked: AchievementItem[] = [];

  for (const def of ACHIEVEMENTS) {
    if (alreadyUnlockedIds.has(def.id)) {
      continue;
    }
    if (def.check(stats, hasAnyCompletion)) {
      newlyUnlocked.push({
        id: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
      });
    }
  }

  return newlyUnlocked;
}
