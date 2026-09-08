import { Role, EventCategory, EventStatus, SeatStatus, BookingStatus, TicketStatus } from '@prisma/client';

export { Role, EventCategory, EventStatus, SeatStatus, BookingStatus, TicketStatus };

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  sessionId: string;
}

export type EventType =
  | 'USER_REGISTERED'
  | 'EVENT_CREATED'
  | 'SEAT_LOCKED'
  | 'SEAT_UNLOCKED'
  | 'BOOKING_CREATED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'TICKET_GENERATED';

export interface StreamEvent {
  event_id: string;
  event_type: EventType;
  timestamp: string;
  producer: string;
  payload: Record<string, any>;
}
