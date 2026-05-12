import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAnalytics } from './controllers/responseController.js';
import { authenticate, authorize } from './middleware/auth.js';

import authRoutes        from './routes/authRoutes.js';
import coordinatorRoutes from './routes/coordinatorRoutes.js';
import superadminRoutes  from './routes/superadminRoutes.js';
import hodRoutes         from './routes/hodRoutes.js';
import responseRoutes    from './routes/responseRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow localhost + all Vercel preview/production deployments ───────
const VERCEL_PATTERN = /^https:\/\/invertis-feedback-system(-[a-z0-9]+)*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (origin === 'http://localhost:5173' || origin === 'http://localhost:3000') return callback(null, true);
    if (VERCEL_PATTERN.test(origin)) return callback(null, true);
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    console.warn(`CORS blocked: ${origin}`);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/api', (req, res) => res.json({ status: 'OK', message: 'Invertis Feedback System API v2 — Supabase' }));

app.use('/api/auth',        authRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/superadmin',  superadminRoutes);
app.use('/api/hod',         hodRoutes);
app.use('/api/student',     responseRoutes);

// Analytics endpoint (super_admin, hod, supreme can access)
app.get('/api/responses/analytics', authenticate, authorize('super_admin', 'hod', 'supreme'), getAnalytics);

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => res.status(404).json({ message: 'API route not found.' }));

const startServer = async () => {
  try {
    await initDb();
    console.log('Database initialized successfully.');
    app.listen(PORT, () => console.log(`Invertis Feedback System running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
