import axios from 'axios';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { prisma } from '../../../../shared/prisma/client.js';
import { redis, getSeatLockKey } from '../../../../shared/redis/client.js';
import { ConflictError, NotFoundError, BadRequestError, ForbiddenError } from '../../../../shared/errors/custom-error.js';
import { publishEvent } from '../../../../shared/events/stream.js';
import { CreateBookingInput, LockSeatInput, SimulatePaymentInput } from '../schemas/booking.schema.js';

const PRICING_SERVICE_URL = process.env.PRICING_SERVICE_URL || 'http://localhost:8004';

export class BookingService {
  /**
   * Atomic Redis Seat Locking (NX EX 300)
   */
  static async lockSeat(userId: string, input: LockSeatInput) {
    const { eventId, seatId } = input;

    // Check if seat exists and is available in DB
    const seat = await prisma.seat.findFirst({
      where: { id: seatId, eventId }
    });

    if (!seat) {
      throw new NotFoundError('Seat not found', 'SEAT_NOT_FOUND');
    }

    if (seat.status === 'SOLD') {
      throw new ConflictError('This seat is currently locked or sold.', 'SEAT_UNAVAILABLE');
    }

    const lockKey = getSeatLockKey(eventId, seatId);
    const ttlSeconds = 300; // 5 minutes

    // Atomic SET key userId NX EX 300
    const acquired = await redis.set(lockKey, userId, 'EX', ttlSeconds, 'NX');

    if (!acquired) {
      throw new ConflictError('This seat is currently locked or sold.', 'SEAT_UNAVAILABLE');
    }

    await publishEvent('SEAT_LOCKED', 'booking-service', {
      eventId,
      seatId,
      userId,
      expiresInSeconds: ttlSeconds
    });

    return {
      message: 'Seat locked successfully',
      lock: {
        eventId,
        seatId,
        seatNumber: seat.seatNumber,
        userId,
        expiresInSeconds: ttlSeconds,
        lockedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Instantly unlock a seat in Redis
   */
  static async unlockSeat(userId: string, input: LockSeatInput, userRole?: string) {
    const { eventId, seatId } = input;

    const lockKey = getSeatLockKey(eventId, seatId);
    const lockOwner = await redis.get(lockKey);

    // If there is no active lock, return success idempotently
    if (!lockOwner) {
      return {
        message: 'Seat is not locked',
        unlocked: { eventId, seatId }
      };
    }

    // Only the user who locked the seat (or an ADMIN) can unlock it
    if (lockOwner !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not hold the lock for this seat', 'FORBIDDEN');
    }

    // Delete the Redis key
    await redis.del(lockKey);

    // Publish stream event
    await publishEvent('SEAT_UNLOCKED', 'booking-service', {
      eventId,
      seatId,
      userId
    });

    return {
      message: 'Seat unlocked successfully',
      unlocked: {
        eventId,
        seatId
      }
    };
  }

  /**
   * Create Booking from locked seats
   */
  static async createBooking(userId: string, input: CreateBookingInput) {
    const { eventId, seatIds } = input;

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    if (event.status === 'CANCELLED') {
      throw new BadRequestError('Cannot book tickets for a cancelled event', 'EVENT_CANCELLED');
    }

    // Verify all requested seats have active Redis locks owned by this user
    for (const seatId of seatIds) {
      const lockKey = getSeatLockKey(eventId, seatId);
      const lockOwner = await redis.get(lockKey);
      if (!lockOwner || lockOwner !== userId) {
        throw new ConflictError(
          `Seat ${seatId} lock has expired or is not held by you`,
          'LOCK_EXPIRED_OR_INVALID'
        );
      }
    }

    // Get current unit price per seat (Call Pricing Service with basePrice fallback)
    let unitPrice = event.basePrice;
    try {
      const response = await axios.get(`${PRICING_SERVICE_URL}/api/pricing/${eventId}`, { timeout: 1500 });
      if (response.data && response.data.current_price) {
        unitPrice = response.data.current_price;
      }
    } catch (err) {
      // Pricing service fallback to base price
      unitPrice = event.basePrice;
    }

    const totalAmount = unitPrice * seatIds.length;

    // Database transaction to create pending booking
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId,
          eventId,
          totalAmount,
          status: 'PENDING_PAYMENT'
        }
      });

      const bookingSeatsData = seatIds.map((seatId) => ({
        bookingId: createdBooking.id,
        seatId,
        price: unitPrice
      }));

      await tx.bookingSeat.createMany({
        data: bookingSeatsData
      });

      return createdBooking;
    });

    await publishEvent('BOOKING_CREATED', 'booking-service', {
      bookingId: booking.id,
      eventId: booking.eventId,
      userId: booking.userId,
      totalAmount: booking.totalAmount,
      seatCount: seatIds.length
    });

    return {
      booking_id: booking.id,
      total_amount: booking.totalAmount,
      status: booking.status,
      seats_count: seatIds.length,
      created_at: booking.createdAt
    };
  }

  /**
   * Simulate Payment & Complete Booking / Generate Tickets
   */
  static async simulatePayment(userId: string, bookingId: string, input: SimulatePaymentInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        bookingSeats: {
          include: { seat: true }
        }
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenError('You do not own this booking', 'UNAUTHORIZED_BOOKING');
    }

    if (booking.status !== 'PENDING_PAYMENT') {
      throw new BadRequestError(`Booking cannot be processed from state ${booking.status}`, 'INVALID_BOOKING_STATUS');
    }

    await publishEvent('PAYMENT_INITIATED', 'booking-service', {
      bookingId: booking.id,
      userId,
      amount: booking.totalAmount
    });

    if (!input.success) {
      // Payment Failed
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'FAILED' }
      });

      // Release Redis locks
      for (const bs of booking.bookingSeats) {
        const lockKey = getSeatLockKey(booking.eventId, bs.seatId);
        await redis.del(lockKey);
      }

      await publishEvent('PAYMENT_FAILED', 'booking-service', {
        bookingId: booking.id,
        userId,
        reason: 'Simulated payment failure'
      });

      return {
        booking_id: booking.id,
        status: 'FAILED',
        message: 'Payment processing failed. Seat locks released.'
      };
    }

    // Payment Succeeded - Process in DB Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED' }
      });

      // Update seats status to SOLD
      const seatIds = booking.bookingSeats.map((bs) => bs.seatId);
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: 'SOLD' }
      });

      // Increment ticketsSold count on event
      await tx.event.update({
        where: { id: booking.eventId },
        data: { ticketsSold: { increment: seatIds.length } }
      });

      // Generate Tickets
      const generatedTickets = [];
      for (const bs of booking.bookingSeats) {
        const ticketCode = `TICK-${randomUUID().substring(0, 8).toUpperCase()}`;
        // Safe identifier in QR Code
        const qrCodeDataUrl = await QRCode.toDataURL(ticketCode);

        const ticket = await tx.ticket.create({
          data: {
            bookingId: booking.id,
            userId: booking.userId,
            eventId: booking.eventId,
            seatId: bs.seatId,
            ticketCode,
            qrCode: qrCodeDataUrl,
            price: bs.price,
            status: 'VALID'
          }
        });

        generatedTickets.push(ticket);
      }

      return { updatedBooking, generatedTickets };
    });

    // Release Redis locks
    for (const bs of booking.bookingSeats) {
      const lockKey = getSeatLockKey(booking.eventId, bs.seatId);
      await redis.del(lockKey);
    }

    // Publish Stream events
    await publishEvent('PAYMENT_SUCCEEDED', 'booking-service', {
      bookingId: booking.id,
      userId,
      amount: booking.totalAmount
    });

    await publishEvent('BOOKING_CONFIRMED', 'booking-service', {
      bookingId: booking.id,
      eventId: booking.eventId,
      userId: booking.userId,
      eventTitle: booking.event.title,
      totalAmount: booking.totalAmount,
      ticketsCount: result.generatedTickets.length
    });

    for (const ticket of result.generatedTickets) {
      await publishEvent('TICKET_GENERATED', 'booking-service', {
        ticketId: ticket.id,
        bookingId: booking.id,
        userId: booking.userId,
        eventId: booking.eventId,
        ticketCode: ticket.ticketCode
      });
    }

    return {
      booking_id: booking.id,
      status: 'CONFIRMED',
      total_amount: booking.totalAmount,
      tickets: result.generatedTickets.map((t) => ({
        ticket_id: t.id,
        ticket_code: t.ticketCode,
        qr_code: t.qrCode,
        status: t.status
      }))
    };
  }

  /**
   * Cancel Booking
   */
  static async cancelBooking(userId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingSeats: true
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenError('You do not own this booking', 'UNAUTHORIZED_BOOKING');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestError('Booking is already cancelled', 'ALREADY_CANCELLED');
    }

    const isConfirmed = booking.status === 'CONFIRMED';
    const seatIds = booking.bookingSeats.map((bs) => bs.seatId);

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });

      if (isConfirmed) {
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: 'AVAILABLE' }
        });

        await tx.event.update({
          where: { id: booking.eventId },
          data: { ticketsSold: { decrement: seatIds.length } }
        });

        await tx.ticket.updateMany({
          where: { bookingId },
          data: { status: 'CANCELLED' }
        });
      }
    });

    // Release any Redis locks
    for (const seatId of seatIds) {
      const lockKey = getSeatLockKey(booking.eventId, seatId);
      await redis.del(lockKey);
    }

    await publishEvent('BOOKING_CANCELLED', 'booking-service', {
      bookingId: booking.id,
      eventId: booking.eventId,
      userId: booking.userId,
      seatCount: seatIds.length
    });

    return { message: 'Booking cancelled successfully', booking_id: booking.id, status: 'CANCELLED' };
  }

  static async getUserBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        bookingSeats: {
          include: { seat: true }
        },
        tickets: true
      }
    });

    return { bookings };
  }

  static async getBookingById(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        bookingSeats: {
          include: { seat: true }
        },
        tickets: true
      }
    });

    if (!booking) {
      throw new NotFoundError('Booking not found', 'BOOKING_NOT_FOUND');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenError('You do not have access to this booking', 'UNAUTHORIZED_BOOKING');
    }

    return { booking };
  }

  static async getUserTickets(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        seat: true
      }
    });

    return { tickets };
  }

  static async getTicketById(ticketId: string, userId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        seat: true
      }
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found', 'TICKET_NOT_FOUND');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenError('You do not own this ticket', 'UNAUTHORIZED_TICKET');
    }

    return { ticket };
  }
}
