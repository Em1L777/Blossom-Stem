// backend/src/controllers/analyticsController.ts
import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';

export class AnalyticsController {
  static async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await AnalyticsService.getDashboardMetrics();
      res.json({ success: true, data: metrics });
    } catch (error) {
      next(error);
    }
  }
}