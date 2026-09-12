import { AttributeType } from './character';

export type QuestDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';
export type QuestType = 'habit' | 'todo' | 'milestone';
export type QuestStatus = 'active' | 'completed' | 'archived';
export type QuestPriority = 'low' | 'medium' | 'high';

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  attribute: AttributeType;
  difficulty: QuestDifficulty;
  type: QuestType;
  status: QuestStatus;
  priority: QuestPriority;
  xpReward: number;
  goldReward: number;
  dueDate?: string;
  completedAt?: string;
  streakCount?: number;
  createdAt: string;
  tags: string[];
}

export interface QuestFilterOptions {
  status: 'all' | 'active' | 'completed';
  type: 'all' | QuestType;
  attribute: 'all' | AttributeType;
  difficulty: 'all' | QuestDifficulty;
  searchQuery: string;
}
