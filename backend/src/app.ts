// backend/src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Healthcheck Route
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/products', productsRoutes);

// Global Error Handler Middleware (MUST be registered last)
app.use(errorHandler);

export default app;