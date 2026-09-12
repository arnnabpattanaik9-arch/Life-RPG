import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { CreateQuestDto, UpdateQuestDto } from '../schemas/quest.schema.js';
import { applyXp, getRewardForDifficulty } from '../services/progression.service.js';
import { computeStreaks, todayKey } from '../services/streak.service.js';
import { evaluateAchievements } from '../services/achievement.service.js';
import { CompletionResult, Attribute } from '../types/index.js';

export async function listQuests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const quests = await prisma.quest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(quests);
  } catch (err) {
    next(err);
  }
}

export async function createQuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const input = req.body as CreateQuestDto;

    const quest = await prisma.quest.create({
      data: {
        userId,
        title: input.title.trim(),
        notes: input.notes?.trim() || null,
        attribute: input.attribute,
        difficulty: input.difficulty,
        type: input.type,
        completed: false,
        lastCompletedDate: null,
        completedAt: null,
      },
    });

    res.status(201).json(quest);
  } catch (err) {
    next(err);
  }
}

export async function updateQuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const questId = req.params.id as string;
    const input = req.body as UpdateQuestDto;

    const existing = await prisma.quest.findFirst({
      where: { id: questId, userId },
    });
    if (!existing) {
      throw new ApiError('Quest not found.', 404);
    }

    if (existing.completed && (input.difficulty !== undefined || input.type !== undefined)) {
      throw new ApiError('Cannot change difficulty or type of an already completed quest.', 400);
    }

    const updated = await prisma.quest.update({
      where: { id: questId },
      data: {
        ...(input.title !== undefined && { title: input.title.trim() }),
        ...(input.notes !== undefined && { notes: input.notes?.trim() || null }),
        ...(input.attribute !== undefined && { attribute: input.attribute }),
        ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
        ...(input.type !== undefined && { type: input.type }),
      },
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteQuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const questId = req.params.id as string;

    const existing = await prisma.quest.findFirst({
      where: { id: questId, userId },
    });
    if (!existing) {
      throw new ApiError('Quest not found.', 404);
    }

    await prisma.quest.delete({
      where: { id: questId },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function completeQuest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const questId = req.params.id as string;
    const today = todayKey();

    const result = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.findFirst({
        where: { id: questId, userId },
      });
      if (!quest) {
        throw new ApiError('Quest not found.', 404);
      }

      // Enforce duplicate prevention
      if (quest.type === 'daily' && quest.lastCompletedDate === today) {
        throw new ApiError('This daily quest was already completed today.', 400);
      }
      if (quest.type === 'quest' && quest.completed) {
        throw new ApiError('This quest was already completed.', 400);
      }

      const character = await tx.character.findUnique({
        where: { userId },
        include: { stats: true, achievements: true },
      });
      if (!character) {
        throw new ApiError('Character not found.', 404);
      }

      const reward = getRewardForDifficulty(quest.difficulty);
      const previousLevel = character.level;
      const leveled = applyXp(character.level, character.xp, reward.xp);

      const historySet = new Set(character.history);
      historySet.add(today);
      const updatedHistory = Array.from(historySet).sort();

      const { current, longest } = computeStreaks(updatedHistory);
      const newLongestStreak = Math.max(longest, character.longestStreak);

      const attrKey = quest.attribute as Attribute;
      const currentStatVal = character.stats ? character.stats[attrKey] : 1;

      // Update character
      await tx.character.update({
        where: { id: character.id },
        data: {
          level: leveled.level,
          xp: leveled.xpIntoLevel,
          gold: character.gold + reward.gold,
          currentStreak: current,
          longestStreak: newLongestStreak,
          lastActiveDate: today,
          history: updatedHistory,
        },
      });

      // Update character stats
      if (character.stats) {
        await tx.characterStats.update({
          where: { id: character.stats.id },
          data: {
            [attrKey]: currentStatVal + 1,
            totalQuestsCompleted: { increment: 1 },
          },
        });
      }

      // Update quest
      const updatedQuest = await tx.quest.update({
        where: { id: quest.id },
        data: {
          lastCompletedDate: today,
          ...(quest.type === 'quest' && {
            completed: true,
            completedAt: new Date(),
          }),
        },
      });

      // Insert QuestCompletion historical record
      await tx.questCompletion.create({
        data: {
          questId: quest.id,
          userId,
          completionDate: today,
          xpAwarded: reward.xp,
          goldAwarded: reward.gold,
          attribute: quest.attribute,
        },
      });

      // Evaluate achievements
      const alreadyUnlocked = new Set(character.achievements.map((a) => a.achievementId));
      const newlyUnlocked = evaluateAchievements(
        {
          level: leveled.level,
          attributes: {
            strength: character.stats?.strength ?? 1,
            intellect: character.stats?.intellect ?? 1,
            vitality: character.stats?.vitality ?? 1,
            agility: character.stats?.agility ?? 1,
            charisma: character.stats?.charisma ?? 1,
            [attrKey]: currentStatVal + 1,
          },
          currentStreak: current,
          longestStreak: newLongestStreak,
        },
        true,
        alreadyUnlocked
      );

      for (const ach of newlyUnlocked) {
        await tx.achievement.upsert({
          where: { id: ach.id },
          update: {},
          create: {
            id: ach.id,
            name: ach.name,
            description: ach.description,
            icon: ach.icon,
          },
        });
        await tx.userAchievement.create({
          data: {
            characterId: character.id,
            achievementId: ach.id,
          },
        });
      }

      const completionResult: CompletionResult = {
        quest: {
          id: updatedQuest.id,
          userId: updatedQuest.userId,
          title: updatedQuest.title,
          notes: updatedQuest.notes ?? undefined,
          attribute: updatedQuest.attribute,
          difficulty: updatedQuest.difficulty,
          type: updatedQuest.type,
          createdAt: updatedQuest.createdAt.toISOString(),
          completed: updatedQuest.completed,
          lastCompletedDate: updatedQuest.lastCompletedDate,
          completedAt: updatedQuest.completedAt?.toISOString() ?? null,
        },
        xpAwarded: reward.xp,
        goldAwarded: reward.gold,
        attribute: quest.attribute,
        leveledUp: leveled.level > previousLevel,
        newLevel: leveled.level,
        previousLevel,
        newlyUnlocked,
      };

      return completionResult;
    }, { maxWait: 10000, timeout: 20000 });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
