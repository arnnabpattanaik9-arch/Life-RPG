import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { CompleteFocusDto } from '../schemas/focus.schema.js';
import { applyXp, calculateFocusRewards } from '../services/progression.service.js';
import { computeStreaks, todayKey } from '../services/streak.service.js';
import { evaluateAchievements } from '../services/achievement.service.js';
import { CompletionResult } from '../types/index.js';

export async function completeFocusSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const { minutes } = req.body as CompleteFocusDto;
    const today = todayKey();

    const result = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId },
        include: { stats: true, achievements: true },
      });
      if (!character) {
        throw new ApiError('Character not found.', 404);
      }

      const { xp, gold } = calculateFocusRewards(minutes);
      const previousLevel = character.level;
      const leveled = applyXp(character.level, character.xp, xp);

      const historySet = new Set(character.history);
      historySet.add(today);
      const updatedHistory = Array.from(historySet).sort();

      const { current, longest } = computeStreaks(updatedHistory);
      const newLongestStreak = Math.max(longest, character.longestStreak);

      const currentIntellect = character.stats?.intellect ?? 1;

      // Update character
      await tx.character.update({
        where: { id: character.id },
        data: {
          level: leveled.level,
          xp: leveled.xpIntoLevel,
          gold: character.gold + gold,
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
            intellect: currentIntellect + 1,
            totalFocusMinutes: { increment: minutes },
          },
        });
      }

      // Persist historical FocusSession record
      await tx.focusSession.create({
        data: {
          userId,
          durationMinutes: minutes,
          xpAwarded: xp,
          goldAwarded: gold,
          attribute: 'intellect',
          date: today,
        },
      });

      // Evaluate achievements
      const alreadyUnlocked = new Set(character.achievements.map((a) => a.achievementId));
      const newlyUnlocked = evaluateAchievements(
        {
          level: leveled.level,
          attributes: {
            strength: character.stats?.strength ?? 1,
            intellect: currentIntellect + 1,
            vitality: character.stats?.vitality ?? 1,
            agility: character.stats?.agility ?? 1,
            charisma: character.stats?.charisma ?? 1,
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
          id: `focus-session-${Date.now()}`,
          userId,
          title: `Focus Dungeon (${minutes} min)`,
          notes: 'Uninterrupted focus session in the Focus Dungeon.',
          attribute: 'intellect',
          difficulty: 'medium',
          type: 'quest',
          createdAt: new Date().toISOString(),
          completed: true,
          lastCompletedDate: today,
          completedAt: new Date().toISOString(),
        },
        xpAwarded: xp,
        goldAwarded: gold,
        attribute: 'intellect',
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
