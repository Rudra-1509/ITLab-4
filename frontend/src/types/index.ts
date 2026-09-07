export type Role = 'AUDIENCE' | 'ORGANIZER' | 'ADMIN';

export type EventCategory = 'CONCERT' | 'THEATER' | 'SPORTS';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'LOCKED' | 'SOLD';

export type BookingStatus = 'PENDING_PAYMENT' | 'PAYMENT_PROCESSING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED';

export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserSession {
  id: string;
  deviceName: string;
  userAgent: string;
  loginTime: string;
  lastActive: string;
  revoked: boolean;
  isCurrent?: boolean;
}

export interface EventItem {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  imageUrl?: string;
  totalCapacity: number;
  ticketsSold: number;
  basePrice: number;
  status: EventStatus;
  createdAt?: string;
  organizer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Seat {
  id: string;
  eventId: string;
  seatNumber: string;
  row: string;
  section: string;
  status: SeatStatus;
  price: number;
}

export interface SeatMapResponse {
  eventId: string;
  totalSeats: number;
  seats: Seat[];
}

export interface PricingDetails {
  event_id: string;
  base_price: number;
  current_price: number;
  occupancy_percentage: number;
  pricing_factors: string[];
}

export interface SeatLockData {
  eventId: string;
  seatId: string;
  seatNumber: string;
  userId: string;
  expiresInSeconds: number;
  lockedAt?: string;
}

export interface SeatLockResponse {
  message: string;
  lock: SeatLockData;
}

export interface BookingSeat {
  id: string;
  bookingId?: string;
  seatId: string;
  price: number;
  seat?: Seat;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  event?: EventItem;
  bookingSeats?: BookingSeat[];
  tickets?: Ticket[];
}

export interface CreateBookingResponse {
  booking_id: string;
  total_amount: number;
  status: BookingStatus;
  seats_count: number;
  created_at: string;
}

export interface TicketSummary {
  ticket_id: string;
  ticket_code: string;
  qr_code: string;
  status: TicketStatus;
}

export interface SimulatePaymentResponse {
  booking_id: string;
  status: BookingStatus;
  total_amount?: number;
  message?: string;
  tickets?: TicketSummary[];
}

export interface Ticket {
  id: string;
  bookingId: string;
  userId: string;
  eventId: string;
  seatId: string;
  ticketCode: string;
  qrCode: string;
  price: number;
  status: TicketStatus;
  createdAt: string;
  event?: EventItem;
  seat?: Seat;
  user?: User;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  ticketsSold: number;
  bookingsCount: number;
  activeEvents: number;
  avgTicketPrice: number;
  occupancyPercentage: number;
}

export interface EventAnalyticsItem {
  eventId: string;
  title: string;
  category: EventCategory;
  ticketsSold: number;
  totalCapacity: number;
  occupancyPercentage: number;
  estimatedRevenue: number;
  status: EventStatus;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface ServiceHealthReport {
  gateway: 'healthy' | 'unhealthy';
  services: {
    auth: 'healthy' | 'unhealthy';
    events: 'healthy' | 'unhealthy';
    booking: 'healthy' | 'unhealthy';
    pricing: 'healthy' | 'unhealthy';
    analytics: 'healthy' | 'unhealthy';
    notifications: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    postgres: 'healthy' | 'unhealthy';
    [key: string]: 'healthy' | 'unhealthy';
  };
}
