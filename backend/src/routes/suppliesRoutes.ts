// backend/src/routes/suppliesRoutes.ts
import { Router } from 'express';
import { Role } from '@prisma/client';
import { SuppliesController } from '../controllers/suppliesController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createSupplyOrderSchema } from '../utils/supplySchemas.js';

const router = Router();

// Защита всех эндпоинтов поставок для ролей FLORIST и OWNER
router.use(authenticate, authorize(Role.FLORIST, Role.OWNER, Role.ADMIN));

router.get('/low-stock', SuppliesController.getLowStock);
router.get('/suppliers', SuppliesController.getSuppliers);
router.get('/', SuppliesController.getAllSupplies);
router.post('/', validate({ body: createSupplyOrderSchema }), SuppliesController.createSupply);

export default router;