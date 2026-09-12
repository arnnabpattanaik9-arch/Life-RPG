import { Difficulty, DIFFICULTY_REWARDS, DifficultyReward } from '../types/index.js';

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export interface LevelState {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export function applyXp(
  level: number,
  xpIntoLevel: number,
  xpGained: number
): LevelState {
  let newLevel = level;
  let xp = xpIntoLevel + xpGained;

  while (xp >= xpForLevel(newLevel)) {
    xp -= xpForLevel(newLevel);
    newLevel += 1;
  }

  return {
    level: newLevel,
    xpIntoLevel: xp,
    xpForNextLevel: xpForLevel(newLevel),
  };
}

export function getRewardForDifficulty(difficulty: Difficulty): DifficultyReward {
  return DIFFICULTY_REWARDS[difficulty] ?? DIFFICULTY_REWARDS.medium;
}

export function calculateFocusRewards(minutes: number): { xp: number; gold: number } {
  const safeMinutes = Math.min(Math.max(1, Math.round(minutes)), 240);
  return {
    xp: Math.round(safeMinutes * 1.6),
    gold: Math.round(safeMinutes * 0.4),
  };
}
