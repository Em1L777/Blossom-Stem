// backend/src/controllers/productsController.ts
import { Request, Response, NextFunction } from 'express';
import { ProductsService } from '../services/productsService.js';

export class ProductsController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductsService.getAll(req.query as any);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductsService.getBySlug(req.params.slug as string);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductsService.create(req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductsService.update(req.params.id as string, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProductsService.delete(req.params.id as string);
      res.json({ success: true, data: { message: 'Product deactivated successfully' } });
    } catch (error) {
      next(error);
    }
  }
}