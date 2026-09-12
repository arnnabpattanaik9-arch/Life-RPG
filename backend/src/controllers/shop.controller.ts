import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { PurchaseItemDto, ToggleEquipDto } from '../schemas/shop.schema.js';
import { SHOP_ITEMS } from '../data/catalog.js';
import { computeStreaks } from '../services/streak.service.js';
import { CharacterResponse } from '../types/index.js';

export async function getCatalog(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(200).json(SHOP_ITEMS);
  } catch (err) {
    next(err);
  }
}

export async function purchaseItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const { itemId } = req.body as PurchaseItemDto;

    // Authoritative server catalog lookup (ignoring any client price input)
    const catalogItem = SHOP_ITEMS.find((item) => item.id === itemId);
    if (!catalogItem) {
      throw new ApiError('Item does not exist in the Armory.', 404);
    }

    const updatedCharacter = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId },
        include: { stats: true, inventory: true, achievements: true },
      });
      if (!character) {
        throw new ApiError('Character not found.', 404);
      }

      if (character.gold < catalogItem.cost) {
        throw new ApiError('Not enough gold.', 400);
      }

      await tx.item.upsert({
        where: { id: catalogItem.id },
        update: {},
        create: {
          id: catalogItem.id,
          name: catalogItem.name,
          description: catalogItem.description,
          cost: catalogItem.cost,
          category: catalogItem.category,
          icon: catalogItem.icon,
        },
      });

      // Deduct gold
      await tx.character.update({
        where: { id: character.id },
        data: {
          gold: character.gold - catalogItem.cost,
        },
      });

      // Update or create inventory item
      const existingInventory = character.inventory.find((i) => i.itemId === itemId);
      if (existingInventory) {
        await tx.inventory.update({
          where: { id: existingInventory.id },
          data: {
            quantity: existingInventory.quantity + 1,
          },
        });
      } else {
        await tx.inventory.create({
          data: {
            characterId: character.id,
            itemId: catalogItem.id,
            quantity: 1,
            equipped: false,
          },
        });
      }

      return tx.character.findUnique({
        where: { userId },
        include: { stats: true, inventory: true, achievements: true },
      });
    }, { maxWait: 10000, timeout: 20000 });

    if (!updatedCharacter) {
      throw new ApiError('Failed to retrieve updated character.', 500);
    }

    const { current, longest } = computeStreaks(updatedCharacter.history);

    const response: CharacterResponse = {
      userId: updatedCharacter.userId,
      stats: {
        level: updatedCharacter.level,
        xp: updatedCharacter.xp,
        gold: updatedCharacter.gold,
        attributes: {
          strength: updatedCharacter.stats?.strength ?? 1,
          intellect: updatedCharacter.stats?.intellect ?? 1,
          vitality: updatedCharacter.stats?.vitality ?? 1,
          agility: updatedCharacter.stats?.agility ?? 1,
          charisma: updatedCharacter.stats?.charisma ?? 1,
        },
        currentStreak: current,
        longestStreak: Math.max(longest, updatedCharacter.longestStreak),
        lastActiveDate: updatedCharacter.lastActiveDate,
        history: updatedCharacter.history,
      },
      inventory: updatedCharacter.inventory.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
        equipped: i.equipped,
      })),
      unlockedAchievements: updatedCharacter.achievements.map((a) => ({
        achievementId: a.achievementId,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function toggleEquip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const { itemId } = req.body as ToggleEquipDto;

    const updatedCharacter = await prisma.$transaction(async (tx) => {
      const character = await tx.character.findUnique({
        where: { userId },
        include: { stats: true, inventory: true, achievements: true },
      });
      if (!character) {
        throw new ApiError('Character not found.', 404);
      }

      const inv = character.inventory.find((i) => i.itemId === itemId);
      if (!inv) {
        throw new ApiError('Item not owned.', 404);
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: {
          equipped: !inv.equipped,
        },
      });

      return tx.character.findUnique({
        where: { userId },
        include: { stats: true, inventory: true, achievements: true },
      });
    }, { maxWait: 10000, timeout: 20000 });

    if (!updatedCharacter) {
      throw new ApiError('Failed to retrieve updated character.', 500);
    }

    const { current, longest } = computeStreaks(updatedCharacter.history);

    const response: CharacterResponse = {
      userId: updatedCharacter.userId,
      stats: {
        level: updatedCharacter.level,
        xp: updatedCharacter.xp,
        gold: updatedCharacter.gold,
        attributes: {
          strength: updatedCharacter.stats?.strength ?? 1,
          intellect: updatedCharacter.stats?.intellect ?? 1,
          vitality: updatedCharacter.stats?.vitality ?? 1,
          agility: updatedCharacter.stats?.agility ?? 1,
          charisma: updatedCharacter.stats?.charisma ?? 1,
        },
        currentStreak: current,
        longestStreak: Math.max(longest, updatedCharacter.longestStreak),
        lastActiveDate: updatedCharacter.lastActiveDate,
        history: updatedCharacter.history,
      },
      inventory: updatedCharacter.inventory.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
        equipped: i.equipped,
      })),
      unlockedAchievements: updatedCharacter.achievements.map((a) => ({
        achievementId: a.achievementId,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
