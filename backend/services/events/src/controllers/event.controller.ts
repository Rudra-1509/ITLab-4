import { Request, Response, NextFunction } from 'express';
import { CreateEventSchema, UpdateEventSchema } from '../schemas/event.schema.js';
import { EventService } from '../services/event.service.js';
import { AuthenticatedRequest } from '../../../../shared/auth/jwt.js';

export class EventController {
  static async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreateEventSchema.parse(req.body);
      const result = await EventService.createEvent(req.user!.userId, validated);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, city, search } = req.query;
      const result = await EventService.getEvents({
        category: category as string,
        city: city as string,
        search: search as string,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await EventService.getEventById(eventId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const validated = UpdateEventSchema.parse(req.body);
      const result = await EventService.updateEvent(
        eventId,
        req.user!.userId,
        req.user!.role,
        validated
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await EventService.deleteEvent(
        eventId,
        req.user!.userId,
        req.user!.role
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getEventSeats(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const result = await EventService.getEventSeats(eventId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
