// backend/src/controllers/usersController.ts
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/usersService.js';

export class UsersController {
  static async getAllUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await UsersService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async createUserByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUser = await UsersService.createUserByAdmin(req.body);
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user!.userId;
      const targetUserId = req.params.id as string;
      const { role } = req.body;

      const updatedUser = await UsersService.updateUserRole(targetUserId, role, currentUserId);
      res.json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  }
}