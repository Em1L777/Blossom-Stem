// backend/src/controllers/categoriesController.ts
import { Request, Response, NextFunction } from 'express';
import { CategoriesService } from '../services/categoriesService.js';

export class CategoriesController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoriesService.getAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoriesService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await CategoriesService.update(req.params.id as string, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CategoriesService.delete(req.params.id as string);
      res.json({ success: true, data: { message: 'Category deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}