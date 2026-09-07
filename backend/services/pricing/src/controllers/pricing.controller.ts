import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service.js';

export class PricingController {
  static async getEventPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await PricingService.calculateEventPrice(eventId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
