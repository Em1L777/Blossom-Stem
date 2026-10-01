// backend/src/routes/productsRoutes.ts
import { Router } from 'express';
import { Role } from '@prisma/client';
import { ProductsController } from '../controllers/productsController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Public Routes
router.get('/', ProductsController.getAll);

// ⚠️ ВАЖНО: /slug/:slug идет строго ПЕРЕД /:id
router.get('/slug/:slug', ProductsController.getBySlug);
router.get('/:id', ProductsController.getById);

// Admin / Owner Protected Routes
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  ProductsController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  ProductsController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  ProductsController.delete
);

export default router;