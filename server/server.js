import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { initDb, gracefulShutdown } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAnalytics } from './controllers/responseController.js';
import { authenticate, authorize } from './middleware/auth.js';

import authRoutes        from './routes/authRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import superadminRoutes  from './routes/superadminRoutes.js';
import hodRoutes         from './routes/hodRoutes.js';
import responseRoutes    from './routes/responseRoutes.js';
import tlfqRoutes        from './routes/tlfqRoutes.js';
import syncRoutes        from './routes/syncRoutes.js';
import userRoutes        from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow localhost + all Vercel/Render deployments ───────
const VERCEL_PATTERN = /^https:\/\/invertis-feedback-system(-[a-z0-9]+)*\.vercel\.app$/;
const RENDER_PATTERN = /^https:\/\/invertis-feedback-system(-[a-z0-9]+)*\.onrender\.com$/;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman, Render health checks)
    if (!origin) return callback(null, true);

    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : [];
    
    // Allow localhost if in development
    if (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || VERCEL_PATTERN.test(origin) || RENDER_PATTERN.test(origin)) {
      return callback(null, true);
    }

    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.trim()) {
      return callback(null, true);
    }

    console.warn(`CORS blocked: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
// Handle OPTIONS preflight requests correctly
app.options('*', cors(corsOptions));

app.use(compression());

// ── Body size limits — prevent memory exhaustion attacks ─────────
app.use(express.json({ limit: '2mb' }));

// ── Request timeout — prevent hung requests from blocking workers ─────────
app.use((req, res, next) => {
  req.setTimeout(30000); // 30s max per request
  res.setTimeout(30000);
  next();
});

// ── Rate Limiting — protect against brute-force & abuse ─────────
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 200,                   // 200 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 15,                     // 15 login attempts per 5 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 5 minutes.' },
});

const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 10,                     // 10 submissions per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Submission rate limit exceeded. Please wait.' },
});

const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,   // 1 minute
  max: 10,                     // Analytics is expensive — limit heavily
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Analytics rate limit exceeded. Please wait.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/check-student', authLimiter);
app.use('/api/student/submit', submitLimiter);

app.get('/api', (req, res) => res.json({ status: 'OK', message: 'Invertis Feedback System API v2' }));

// Health check endpoint for Render — includes DB connectivity check
app.get('/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));

app.use('/api/auth',        authRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/superadmin',  superadminRoutes);
app.use('/api/hod',         hodRoutes);
app.use('/api/student',     responseRoutes);
app.use('/api/tlfq',        tlfqRoutes);
app.use('/api/sync',        syncRoutes);
app.use('/api/users',       userRoutes);

// Analytics endpoint (super_admin, hod, supreme can access) — rate limited
app.get('/api/responses/analytics', analyticsLimiter, authenticate, authorize('super_admin', 'hod', 'supreme'), getAnalytics);

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => res.status(404).json({ message: 'API route not found.' }));

let server;

const startServer = async () => {
  try {
    await initDb();
    console.log('Database initialized successfully.');
    server = app.listen(PORT, () => console.log(`Invertis Feedback System running at http://localhost:${PORT}`));

    // Keep-alive timeout: ensure connections are cleaned up promptly
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// ── Graceful Shutdown — drain connections on SIGTERM/SIGINT ──────
const shutdown = async (signal) => {
  console.log(`\n[server] ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('[server] HTTP server closed.');
      await gracefulShutdown();
      process.exit(0);
    });
    // Force kill after 10s if graceful shutdown stalls
    setTimeout(() => {
      console.error('[server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    await gracefulShutdown();
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();
