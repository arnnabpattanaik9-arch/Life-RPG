export type CharacterClass = 'vanguard' | 'technomancer' | 'shadow' | 'paladin' | 'scholar';

export type AttributeType = 'strength' | 'intellect' | 'vitality' | 'agility' | 'charisma';

export interface AttributeStat {
  level: number;
  currentXp: number;
  maxXp: number;
  tasksCompleted: number;
}

export interface CharacterAttributes {
  strength: AttributeStat;
  intellect: AttributeStat;
  vitality: AttributeStat;
  agility: AttributeStat;
  charisma: AttributeStat;
}

export interface EquippedGear {
  weaponId?: string;
  armorId?: string;
  accessoryId?: string;
}

export interface CharacterProfile {
  id: string;
  userId: string;
  name: string;
  title: string;
  bio: string;
  characterClass: CharacterClass;
  avatarUrl: string;
  level: number;
  currentXp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  gems: number;
  streak: number;
  longestStreak: number;
  streakShieldActive: boolean;
  lastActiveDate: string;
  streakHistory: string[]; // dates of activity (ISO strings YYYY-MM-DD)
  attributes: CharacterAttributes;
  equippedGear: EquippedGear;
  unlockedBadges: string[];
}

export interface BossEntity {
  id: string;
  name: string;
  title: string;
  currentHp: number;
  maxHp: number;
  level: number;
  avatarUrl: string;
  description: string;
  rewardGold: number;
  rewardXp: number;
  rewardBadge: string;
  defeated: boolean;
}
