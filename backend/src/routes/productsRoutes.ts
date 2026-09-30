// backend/src/routes/productsRoutes.ts
import { Router } from 'express';
import { Role } from '@prisma/client';
import { ProductsController } from '../controllers/productsController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../utils/catalogSchemas.js';

const router = Router();

router.get('/', validate({ query: productQuerySchema }), ProductsController.getAll);
router.get('/:slug', ProductsController.getBySlug);

router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  validate({ body: createProductSchema }),
  ProductsController.create
);

router.put(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  validate({ body: updateProductSchema }),
  ProductsController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  ProductsController.delete
);

export default router;