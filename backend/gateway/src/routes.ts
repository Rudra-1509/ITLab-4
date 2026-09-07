import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
  events: process.env.EVENT_SERVICE_URL || 'http://localhost:8002',
  bookings: process.env.BOOKING_SERVICE_URL || 'http://localhost:8003',
  pricing: process.env.PRICING_SERVICE_URL || 'http://localhost:8004',
  analytics: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8005',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8006',
};

export const createProxyHandler = (targetBaseUrl: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetUrl = `${targetBaseUrl}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: {
          authorization: req.headers.authorization || '',
          'content-type': req.headers['content-type'] || 'application/json',
          'user-agent': req.headers['user-agent'] || '',
        },
        validateStatus: () => true, // Forward all status codes directly
      });

      return res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Target microservice is currently unavailable',
          },
        });
      }
      next(error);
    }
  };
};

export const serviceTargets = SERVICES;
