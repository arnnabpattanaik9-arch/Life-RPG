import { QuestDifficulty } from '../types/quest';
import { AttributeType, CharacterProfile } from '../types/character';
import { InventoryItem } from '../types/shop';

/**
 * Non-linear leveling system formula:
 * XP_required(L) = floor(100 * L^1.5)
 * Each level requires progressively more XP than the last.
 */
export const calculateMaxXpForLevel = (level: number): number => {
  return Math.max(100, Math.floor(100 * Math.pow(level, 1.5)));
};

/**
 * Attribute level formula:
 * XP_required(L) = floor(50 * L^1.4)
 */
export const calculateAttributeMaxXp = (level: number): number => {
  return Math.max(50, Math.floor(50 * Math.pow(level, 1.4)));
};

/**
 * Base rewards based on quest difficulty
 */
export const BASE_REWARDS: Record<QuestDifficulty, { xp: number; gold: number }> = {
  trivial: { xp: 15, gold: 8 },
  easy: { xp: 30, gold: 15 },
  medium: { xp: 60, gold: 30 },
  hard: { xp: 120, gold: 60 },
  epic: { xp: 250, gold: 125 },
};

/**
 * Calculate total rewards factoring in gear modifiers, attribute affinity, and streak bonus
 */
export const calculateEarnedRewards = (
  difficulty: QuestDifficulty,
  attribute: AttributeType,
  profile: CharacterProfile,
  inventory: InventoryItem[]
): { finalXp: number; finalGold: number; bossDamage: number } => {
  const base = BASE_REWARDS[difficulty];
  let xpMultiplier = 1.0;
  let goldMultiplier = 1.0;

  // Streak bonus: +2% bonus per consecutive day (capped at +50%)
  const streakBonus = Math.min(0.5, profile.streak * 0.02);
  xpMultiplier += streakBonus;
  goldMultiplier += streakBonus;

  // Equipment passive multipliers
  const equippedItems = inventory.filter((inv) => inv.isEquipped);
  for (const eq of equippedItems) {
    if (eq.item.modifier.xpBonusPercent) {
      xpMultiplier += eq.item.modifier.xpBonusPercent / 100;
    }
    if (eq.item.modifier.goldBonusPercent) {
      goldMultiplier += eq.item.modifier.goldBonusPercent / 100;
    }
    if (eq.item.modifier.attributeBoost && eq.item.modifier.attributeBoost.attribute === attribute) {
      xpMultiplier += (eq.item.modifier.attributeBoost.multiplier - 1);
    }
  }

  const finalXp = Math.round(base.xp * xpMultiplier);
  const finalGold = Math.round(base.gold * goldMultiplier);

  // Boss damage is derived from quest difficulty + character level
  const difficultyDamageMultipliers: Record<QuestDifficulty, number> = {
    trivial: 10,
    easy: 25,
    medium: 55,
    hard: 110,
    epic: 220,
  };
  const bossDamage = Math.round(difficultyDamageMultipliers[difficulty] * (1 + profile.level * 0.05));

  return { finalXp, finalGold, bossDamage };
};
