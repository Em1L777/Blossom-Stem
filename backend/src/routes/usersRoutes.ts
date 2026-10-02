// backend/src/routes/usersRoutes.ts
import { Router } from 'express';
import { Role } from '@prisma/client';
import { UsersController } from '../controllers/usersController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Защищаем все маршруты пользователей: доступ только ADMIN и OWNER
router.use(authenticate, authorize(Role.ADMIN, Role.OWNER));

router.get('/', UsersController.getAllUsers);
router.post('/', UsersController.createUserByAdmin);
router.patch('/:id/role', UsersController.updateUserRole);

export default router;