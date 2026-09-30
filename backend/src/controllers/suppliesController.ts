// backend/src/controllers/suppliesController.ts
import { Request, Response, NextFunction } from 'express';
import { SuppliesService } from '../services/suppliesService.js';

export class SuppliesController {
  static async getLowStock(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await SuppliesService.getLowStockProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  static async getSuppliers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suppliers = await SuppliesService.getSuppliers();
      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  static async createSupply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const createdById = req.user!.userId;
      const supply = await SuppliesService.createSupplyOrder(req.body, createdById);
      res.status(201).json({ success: true, data: supply });
    } catch (error) {
      next(error);
    }
  }

  static async getAllSupplies(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const supplies = await SuppliesService.getAllSupplies();
      res.json({ success: true, data: supplies });
    } catch (error) {
      next(error);
    }
  }
}