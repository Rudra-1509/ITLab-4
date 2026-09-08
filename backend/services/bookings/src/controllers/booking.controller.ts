import { Response, NextFunction } from 'express';
import { LockSeatSchema, CreateBookingSchema, SimulatePaymentSchema } from '../schemas/booking.schema.js';
import { BookingService } from '../services/booking.service.js';
import { AuthenticatedRequest } from '../../../../shared/auth/jwt.js';

export class BookingController {
  static async lockSeat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = LockSeatSchema.parse(req.body);
      const result = await BookingService.lockSeat(req.user!.userId, validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unlockSeat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = LockSeatSchema.parse(req.body);
      const result = await BookingService.unlockSeat(req.user!.userId, validated, req.user?.role);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreateBookingSchema.parse(req.body);
      const result = await BookingService.createBooking(req.user!.userId, validated);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async simulatePayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const validated = SimulatePaymentSchema.parse(req.body);
      const result = await BookingService.simulatePayment(req.user!.userId, bookingId, validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async cancelBooking(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const result = await BookingService.cancelBooking(req.user!.userId, bookingId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.getUserBookings(req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getBookingById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      const result = await BookingService.getBookingById(bookingId, req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.getUserTickets(req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getTicketById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { ticketId } = req.params;
      const result = await BookingService.getTicketById(ticketId, req.user!.userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
