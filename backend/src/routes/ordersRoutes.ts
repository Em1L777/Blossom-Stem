// backend/src/routes/ordersRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { OrdersController } from '../controllers/ordersController.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { verifyToken } from '../utils/jwt.js';
import { createOrderSchema, updateOrderStatusSchema } from '../utils/orderSchemas.js';

const router = Router();

// Вспомогательный middleware: извлекает JWT, если он передан, но не блокирует гостя
const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = verifyToken(token);
    } catch {
      // Игнорируем ошибку для гостей с невалидным токеном
    }
  }
  next();
};

// Public / Guest / Client order creation
router.post('/', optionalAuthenticate, validate({ body: createOrderSchema }), OrdersController.createOrder);

// Client orders history
router.get('/my-orders', authenticate, OrdersController.getMyOrders);

// Florist Workspace
router.get(
  '/florist/workspace',
  authenticate,
  authorize(Role.FLORIST, Role.ADMIN, Role.OWNER),
  OrdersController.getFloristWorkspace
);
router.patch(
  '/:id/assemble',
  authenticate,
  authorize(Role.FLORIST, Role.ADMIN, Role.OWNER),
  OrdersController.assembleOrder
);

// Courier Workspace
router.get(
  '/courier/workspace',
  authenticate,
  authorize(Role.COURIER, Role.ADMIN, Role.OWNER),
  OrdersController.getCourierWorkspace
);
router.patch(
  '/:id/delivery-status',
  authenticate,
  authorize(Role.COURIER, Role.ADMIN, Role.OWNER),
  validate({ body: updateOrderStatusSchema }),
  OrdersController.updateDeliveryStatus
);

// Order by Order Number (Guest / Client Receipt)
router.get('/:orderNumber', optionalAuthenticate, OrdersController.getByOrderNumber);

// Admin / Owner All Orders
router.get('/', authenticate, authorize(Role.ADMIN, Role.OWNER), OrdersController.getAllOrders);
router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.ADMIN, Role.OWNER),
  validate({ body: updateOrderStatusSchema }),
  OrdersController.updateStatusByAdmin
);

export default router;