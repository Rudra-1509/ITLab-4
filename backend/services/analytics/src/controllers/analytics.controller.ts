import { Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { AuthenticatedRequest } from '../../../../shared/auth/jwt.js';

export class AnalyticsController {
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getOverview(req.user!.userId, req.user!.role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getEventAnalytics(req.user!.userId, req.user!.role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getRevenueAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getRevenueAnalytics(req.user!.userId, req.user!.role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
