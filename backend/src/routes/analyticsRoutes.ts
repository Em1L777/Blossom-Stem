// backend/src/routes/analyticsRoutes.ts
import { Router } from 'express';
import { Role } from '@prisma/client';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Эксклюзивный доступ только для роли OWNER
router.get('/dashboard', authenticate, authorize(Role.OWNER), AnalyticsController.getDashboard);

export default router;