import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__prismaClient ??
  new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    log: config.isProduction ? ['error', 'warn'] : ['warn', 'error'],
  });

if (!config.isProduction) {
  globalThis.__prismaClient = prisma;
}
