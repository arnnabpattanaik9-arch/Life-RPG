import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { todayKey, daysBetween } from '../services/streak.service.js';
import { createHabitSchema, CreateHabitDto } from '../schemas/habit.schema.js';
export { createHabitSchema };

export async function listHabits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        completions: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(habits);
  } catch (err) {
    next(err);
  }
}

export async function createHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const input = createHabitSchema.parse(req.body);

    const habit = await prisma.habit.create({
      data: {
        userId,
        title: input.title.trim(),
        notes: input.notes?.trim() || null,
        attribute: input.attribute,
        frequency: input.frequency,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    res.status(201).json(habit);
  } catch (err) {
    next(err);
  }
}

export async function completeHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const habitId = req.params.id as string;
    const today = todayKey();

    const result = await prisma.$transaction(async (tx) => {
      const habit = await tx.habit.findFirst({
        where: { id: habitId, userId },
      });
      if (!habit) {
        throw new ApiError('Habit not found.', 404);
      }

      const completions = await tx.habitCompletion.findMany({
        where: { habitId },
        orderBy: { date: 'desc' },
        take: 30,
      });

      const existingToday = completions.find((c) => c.date === today);
      if (existingToday) {
        throw new ApiError('Habit already completed today.', 400);
      }

      // Compute habit streak
      let newStreak = 1;
      const lastCompletion = completions[0];
      if (lastCompletion) {
        const gap = daysBetween(lastCompletion.date, today);
        if (gap === 1) {
          newStreak = habit.currentStreak + 1;
        }
      }
      const newLongest = Math.max(newStreak, habit.longestStreak);

      await tx.habitCompletion.create({
        data: {
          habitId: habit.id,
          userId,
          date: today,
        },
      });

      const updated = await tx.habit.update({
        where: { id: habit.id },
        data: {
          currentStreak: newStreak,
          longestStreak: newLongest,
        },
      });

      return updated;
    }, { maxWait: 10000, timeout: 20000 });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId || req.session.userId;
    if (!userId) throw new ApiError('Not authenticated.', 401);

    const habitId = req.params.id as string;

    const existing = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
    if (!existing) {
      throw new ApiError('Habit not found.', 404);
    }

    await prisma.habit.delete({
      where: { id: habitId },
    });

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}
