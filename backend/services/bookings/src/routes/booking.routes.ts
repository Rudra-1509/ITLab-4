import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller.js';
import { authenticateToken } from '../../../../shared/auth/jwt.js';

export const bookingRouter = Router();
export const paymentRouter = Router();
export const ticketRouter = Router();

// Booking routes
bookingRouter.post('/lock', authenticateToken, BookingController.lockSeat);
bookingRouter.post('/', authenticateToken, BookingController.createBooking);
bookingRouter.get('/my', authenticateToken, BookingController.getUserBookings);
bookingRouter.get('/:bookingId', authenticateToken, BookingController.getBookingById);
bookingRouter.post('/:bookingId/cancel', authenticateToken, BookingController.cancelBooking);

// Payment routes
paymentRouter.post('/:bookingId/simulate', authenticateToken, BookingController.simulatePayment);

// Ticket routes
ticketRouter.get('/my', authenticateToken, BookingController.getUserTickets);
ticketRouter.get('/:ticketId', authenticateToken, BookingController.getTicketById);
