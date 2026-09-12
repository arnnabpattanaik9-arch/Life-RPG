import { Request, Response, NextFunction } from 'express';
import argon2 from 'argon2';
import { prisma } from '../db/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { SignupInput, LoginInput } from '../schemas/auth.schema.js';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body as SignupInput;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ApiError('An account already exists for that email.', 409);
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456, // 19 MiB OWASP recommendation
      timeCost: 2,
    });

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
        },
      });

      const character = await tx.character.create({
        data: {
          userId: newUser.id,
          level: 1,
          xp: 0,
          gold: 25,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
          history: [],
        },
      });

      await tx.characterStats.create({
        data: {
          characterId: character.id,
          strength: 1,
          intellect: 1,
          vitality: 1,
          agility: 1,
          charisma: 1,
        },
      });

      return newUser;
    }, { maxWait: 10000, timeout: 20000 });

    req.session.userId = user.id;

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!user) {
      throw new ApiError('Incorrect email or password.', 401);
    }

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      throw new ApiError('Incorrect email or password.', 401);
    }

    req.session.userId = user.id;

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    req.session.destroy((err) => {
      if (err) {
        return next(new ApiError('Failed to logout cleanly.', 500));
      }
      res.clearCookie('liferpg.sid');
      res.clearCookie('connect.sid');
      res.status(200).json({ success: true });
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.session.userId;
    if (!userId) {
      res.status(200).json(null);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      req.session.destroy(() => {});
      res.status(200).json(null);
      return;
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
