import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.session.userId;
  if (!userId) {
    throw new ApiError('Not authenticated. Please sign in again.', 401);
  }
  req.userId = userId;
  next();
}
