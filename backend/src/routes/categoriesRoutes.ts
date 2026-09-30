// backend/src/routes/categoriesRoutes.ts
import { Router } from 'express';
import { Role } from '@prisma/client';
import { CategoriesController } from '../controllers/categoriesController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createCategorySchema, updateCategorySchema } from '../utils/catalogSchemas.js';

const router = Router();

router.get('/', CategoriesController.getAll);

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  validate({ body: createCategorySchema }),
  CategoriesController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  validate({ body: updateCategorySchema }),
  CategoriesController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  CategoriesController.delete
);

export default router;