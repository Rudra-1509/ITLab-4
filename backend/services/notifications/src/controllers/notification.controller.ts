import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../../../../shared/auth/jwt.js';

export class NotificationController {
  static async getUserNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.getUserNotifications(req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await NotificationService.markAsRead(id, req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
