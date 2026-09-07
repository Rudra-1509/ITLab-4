import { apiClient } from './client';
import {
  Booking,
  CreateBookingResponse,
  SeatLockResponse,
  SimulatePaymentResponse,
} from '../types';
import { INITIAL_EVENTS } from './mockData';

export interface LockSeatPayload {
  eventId: string;
  seatId: string;
}

export interface CreateBookingPayload {
  eventId: string;
  seatIds: string[];
}

export interface SimulatePaymentPayload {
  success: boolean;
}

// In-memory bookings for demo resilience
let localBookings: Booking[] = [
  {
    id: 'book-sample-01',
    userId: 'usr-demo-audience-01',
    eventId: 'evt-001',
    totalAmount: 2400,
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    event: INITIAL_EVENTS[0],
    bookingSeats: [
      {
        id: 'bs-1',
        seatId: 'seat-evt-001-A1',
        price: 1200,
        seat: {
          id: 'seat-evt-001-A1',
          eventId: 'evt-001',
          seatNumber: 'A1',
          row: 'A',
          section: 'MAIN',
          status: 'SOLD',
          price: 1200,
        },
      },
      {
        id: 'bs-2',
        seatId: 'seat-evt-001-A2',
        price: 1200,
        seat: {
          id: 'seat-evt-001-A2',
          eventId: 'evt-001',
          seatNumber: 'A2',
          row: 'A',
          section: 'MAIN',
          status: 'SOLD',
          price: 1200,
        },
      },
    ],
  },
];

export const bookingsApi = {
  async lockSeat(payload: LockSeatPayload): Promise<SeatLockResponse> {
    try {
      const { data } = await apiClient.post<SeatLockResponse>('/bookings/lock', payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Bookings] Backend offline, simulating Redis atomic lock (300s)');
        const seatParts = payload.seatId.split('-');
        const seatNum = seatParts[seatParts.length - 1] || 'A1';
        return {
          message: 'Seat locked successfully',
          lock: {
            eventId: payload.eventId,
            seatId: payload.seatId,
            seatNumber: seatNum,
            userId: 'usr-demo-audience-01',
            expiresInSeconds: 300,
            lockedAt: new Date().toISOString(),
          },
        };
      }
      throw error;
    }
  },

  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    try {
      const { data } = await apiClient.post<CreateBookingResponse>('/bookings', payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Bookings] Backend offline, creating demo booking');
        const bookingId = `book-${Date.now()}`;
        const event = INITIAL_EVENTS.find((e) => e.id === payload.eventId) || INITIAL_EVENTS[0];
        const total = event.basePrice * payload.seatIds.length;

        const newBooking: Booking = {
          id: bookingId,
          userId: 'usr-demo-audience-01',
          eventId: payload.eventId,
          totalAmount: total,
          status: 'PENDING_PAYMENT',
          createdAt: new Date().toISOString(),
          event,
          bookingSeats: payload.seatIds.map((sid, idx) => ({
            id: `bs-${idx}-${Date.now()}`,
            seatId: sid,
            price: event.basePrice,
          })),
        };
        localBookings.unshift(newBooking);

        return {
          booking_id: bookingId,
          total_amount: total,
          status: 'PENDING_PAYMENT',
          seats_count: payload.seatIds.length,
          created_at: newBooking.createdAt,
        };
      }
      throw error;
    }
  },

  async simulatePayment(
    bookingId: string,
    payload: SimulatePaymentPayload
  ): Promise<SimulatePaymentResponse> {
    try {
      const { data } = await apiClient.post<SimulatePaymentResponse>(
        `/payments/${bookingId}/simulate`,
        payload
      );
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Payments] Backend offline, simulating payment result');
        const booking = localBookings.find((b) => b.id === bookingId);
        if (!payload.success) {
          if (booking) booking.status = 'FAILED';
          return {
            booking_id: bookingId,
            status: 'FAILED',
            message: 'Simulated payment failed. Seat locks released.',
          };
        }

        if (booking) booking.status = 'CONFIRMED';
        const tickets = (booking?.bookingSeats || [{ id: 'bs-1', seatId: 'seat-A1', price: 1000 }]).map(
          (bs, idx) => {
            const ticketCode = `TICK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            return {
              ticket_id: `tkt-${bookingId}-${idx + 1}`,
              ticket_code: ticketCode,
              qr_code: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23fff"/><text x="10" y="50" font-size="12" fill="%23000">${ticketCode}</text></svg>`,
              status: 'VALID' as const,
            };
          }
        );

        return {
          booking_id: bookingId,
          status: 'CONFIRMED',
          total_amount: booking?.totalAmount || 1200,
          tickets,
        };
      }
      throw error;
    }
  },

  async getMyBookings(): Promise<{ bookings: Booking[] }> {
    try {
      const { data } = await apiClient.get<{ bookings: Booking[] }>('/bookings/my');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return { bookings: localBookings };
      }
      throw error;
    }
  },

  async getBookingById(bookingId: string): Promise<{ booking: Booking }> {
    try {
      const { data } = await apiClient.get<{ booking: Booking }>(`/bookings/${bookingId}`);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const found = localBookings.find((b) => b.id === bookingId) || localBookings[0];
        return { booking: found };
      }
      throw error;
    }
  },

  async cancelBooking(bookingId: string): Promise<{ message: string; booking_id: string; status: string }> {
    try {
      const { data } = await apiClient.post<{ message: string; booking_id: string; status: string }>(
        `/bookings/${bookingId}/cancel`
      );
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        localBookings = localBookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        );
        return {
          message: 'Booking cancelled successfully',
          booking_id: bookingId,
          status: 'CANCELLED',
        };
      }
      throw error;
    }
  },
};
