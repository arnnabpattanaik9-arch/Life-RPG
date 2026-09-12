import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, ApiError } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration for frontend
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (config.corsOrigins.includes(origin) || !config.isProduction) {
        return callback(null, true);
      }
      return callback(new ApiError('Not allowed by CORS', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use('/api', apiLimiter);

// PostgreSQL session store
const PgSession = connectPgSimple(session);
let sessionStore: session.Store;

try {
  const isSsl = config.databaseUrl.includes('sslmode=require') || config.databaseUrl.includes('neon.tech');
  const pgPool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
  });
  pgPool.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('PostgreSQL pool idle client error:', err);
  });
  sessionStore = new PgSession({
    pool: pgPool,
    tableName: 'session',
    createTableIfMissing: true,
  });
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn('PostgreSQL session store initialization warning, using MemoryStore fallback:', err);
  sessionStore = new session.MemoryStore();
}

app.use(
  session({
    store: sessionStore,
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'liferpg.sid',
    cookie: {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount master API routes
app.use('/api', apiRouter);

// 404 handler for unknown routes
app.use((_req, _res, next) => {
  next(new ApiError('Endpoint not found.', 404));
});

// Centralized error handling
app.use(errorHandler);

const isMain = process.argv[1] && (
  process.argv[1].endsWith('index.ts') ||
  process.argv[1].endsWith('index.js')
);

if (process.env.NODE_ENV !== 'test' && isMain) {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[Life RPG API] Server listening on http://localhost:${config.port}`);
  });
}

export default app;
