import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend root regardless of current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  const user = process.env.PGUSER || 'postgres';
  const pass = process.env.PGPASSWORD || '';
  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT || '5432';
  const db = process.env.PGDATABASE || 'life_rpg';
  const encodedPass = pass ? `:${encodeURIComponent(pass)}` : '';
  return `postgresql://${user}${encodedPass}@${host}:${port}/${db}?schema=public`;
}

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174'),
  SESSION_SECRET: z.string().min(8).default('life-rpg-secure-session-secret-key-32chars!'),
  DATABASE_URL: z.string().min(1),
});

const parsed = envSchema.safeParse({
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DATABASE_URL: resolveDatabaseUrl(),
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const config = {
  port: parsed.data.PORT,
  isProduction: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((s) => s.trim().replace(/\/+$/, '')),
  sessionSecret: parsed.data.SESSION_SECRET,
  databaseUrl: parsed.data.DATABASE_URL,
};
