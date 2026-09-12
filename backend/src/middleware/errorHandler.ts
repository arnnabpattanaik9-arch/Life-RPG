import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message, status: err.status });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.') || 'body'}: ${e.message}`).join(', ');
    res.status(400).json({ message, status: 400 });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
      res.status(409).json({ message: `Unique constraint failed on ${target}.`, status: 409 });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ message: 'Resource not found.', status: 404 });
      return;
    }
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error.', status: 500 });
}
