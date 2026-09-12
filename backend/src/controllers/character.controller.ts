import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { computeStreaks } from '../services/streak.service.js';
import { CharacterResponse } from '../types/index.js';

export async function getCharacter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) {
      throw new ApiError('Not authenticated.', 401);
    }

    const character = await prisma.character.findUnique({
      where: { userId },
      include: {
        stats: true,
        inventory: true,
        achievements: true,
      },
    });

    if (!character) {
      throw new ApiError('Character not found.', 404);
    }

    const { current, longest } = computeStreaks(character.history);

    const response: CharacterResponse = {
      userId: character.userId,
      stats: {
        level: character.level,
        xp: character.xp,
        gold: character.gold,
        attributes: {
          strength: character.stats?.strength ?? 1,
          intellect: character.stats?.intellect ?? 1,
          vitality: character.stats?.vitality ?? 1,
          agility: character.stats?.agility ?? 1,
          charisma: character.stats?.charisma ?? 1,
        },
        currentStreak: current,
        longestStreak: Math.max(longest, character.longestStreak),
        lastActiveDate: character.lastActiveDate,
        history: character.history,
      },
      inventory: character.inventory.map((inv) => ({
        itemId: inv.itemId,
        quantity: inv.quantity,
        equipped: inv.equipped,
      })),
      unlockedAchievements: character.achievements.map((ach) => ({
        achievementId: ach.achievementId,
        unlockedAt: ach.unlockedAt.toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
