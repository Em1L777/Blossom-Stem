// backend/src/controllers/ordersController.ts
import { Request, Response, NextFunction } from 'express';
import { OrdersService } from '../services/ordersService.js';

export class OrdersController {
  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const order = await OrdersService.createOrder(req.body, userId);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orders = await OrdersService.getMyOrders(userId);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async getByOrderNumber(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUserId = req.user?.userId;
      const userRole = req.user?.role;
      const order = await OrdersService.getByOrderNumber(
        req.params.orderNumber as string,
        currentUserId,
        userRole
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getFloristWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await OrdersService.getFloristWorkspaceOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async assembleOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrdersService.assembleOrder(req.params.id as string);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getCourierWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await OrdersService.getCourierWorkspaceOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async updateDeliveryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrdersService.updateDeliveryStatus(
        req.params.id as string,
        req.body.status
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  static async getAllOrders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await OrdersService.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatusByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrdersService.updateStatusByAdmin(
        req.params.id as string,
        req.body.status
      );
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}