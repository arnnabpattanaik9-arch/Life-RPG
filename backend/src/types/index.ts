export type Attribute =
  | 'strength'
  | 'intellect'
  | 'vitality'
  | 'agility'
  | 'charisma';

export const ATTRIBUTES: Attribute[] = [
  'strength',
  'intellect',
  'vitality',
  'agility',
  'charisma',
];

export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';

export type QuestType = 'quest' | 'daily';

export interface DifficultyReward {
  xp: number;
  gold: number;
  label: string;
}

export const DIFFICULTY_REWARDS: Record<Difficulty, DifficultyReward> = {
  trivial: { xp: 15, gold: 3, label: 'Trivial' },
  easy: { xp: 30, gold: 8, label: 'Easy' },
  medium: { xp: 60, gold: 16, label: 'Medium' },
  hard: { xp: 110, gold: 30, label: 'Hard' },
  epic: { xp: 200, gold: 60, label: 'Epic' },
};

export interface CharacterStats {
  level: number;
  xp: number;
  gold: number;
  attributes: Record<Attribute, number>;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  history: string[];
}

export interface InventoryEntry {
  itemId: string;
  quantity: number;
  equipped?: boolean;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

export interface CharacterResponse {
  userId: string;
  stats: CharacterStats;
  inventory: InventoryEntry[];
  unlockedAchievements: UnlockedAchievement[];
}

export interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CompletionResult {
  quest: {
    id: string;
    userId: string;
    title: string;
    notes?: string;
    attribute: Attribute;
    difficulty: Difficulty;
    type: QuestType;
    createdAt: string;
    completed: boolean;
    lastCompletedDate?: string | null;
    completedAt?: string | null;
  };
  xpAwarded: number;
  goldAwarded: number;
  attribute: Attribute;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
  newlyUnlocked: AchievementItem[];
}
