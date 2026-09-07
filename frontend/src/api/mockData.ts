import { EventItem, User, UserSession, Seat, PricingDetails, NotificationItem, AnalyticsOverview, EventAnalyticsItem, RevenueDataPoint, ServiceHealthReport } from '../types';

export const DEMO_USERS: Record<string, User> = {
  'user@example.com': {
    id: 'usr-demo-audience-01',
    name: 'John Audience',
    email: 'user@example.com',
    role: 'AUDIENCE',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  'organizer@example.com': {
    id: 'usr-demo-organizer-02',
    name: 'Campus Event Organizer',
    email: 'organizer@example.com',
    role: 'ORGANIZER',
    createdAt: '2026-08-15T12:00:00.000Z',
  },
  'admin@example.com': {
    id: 'usr-demo-admin-03',
    name: 'System Administrator',
    email: 'admin@example.com',
    role: 'ADMIN',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
};

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-001',
    organizerId: 'usr-demo-organizer-02',
    title: 'Grand Symphony Orchestra',
    description: 'An evening of majestic classical music performed by the university symphony orchestra with guest virtuosos.',
    category: 'CONCERT',
    venue: 'Auditorium Main Hall',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 5).toISOString(),
    startTime: '19:00',
    endTime: '22:00',
    basePrice: 1200,
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 38,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
  {
    id: 'evt-002',
    organizerId: 'usr-demo-organizer-02',
    title: 'Rock Fest 2026',
    description: 'High energy rock and indie bands live on stage with full arena lighting and pyrotechnics.',
    category: 'CONCERT',
    venue: 'Campus Open Field',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 12).toISOString(),
    startTime: '18:00',
    endTime: '23:00',
    basePrice: 800,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 22,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
  {
    id: 'evt-003',
    organizerId: 'usr-demo-organizer-02',
    title: 'Electronic Beats Night',
    description: 'Sub-zero basslines, synthesizer magic, and electrifying audio-visuals from student and international DJs.',
    category: 'CONCERT',
    venue: 'Student Union Arena',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 20).toISOString(),
    startTime: '21:00',
    endTime: '02:00',
    basePrice: 600,
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 15,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
  {
    id: 'evt-004',
    organizerId: 'usr-demo-organizer-02',
    title: 'Shakespeare in the Park: Hamlet',
    description: 'A timeless, thrilling production of Hamlet under the evening sky in the central university amphitheater.',
    category: 'THEATER',
    venue: 'Central Amphitheater',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 3).toISOString(),
    startTime: '18:30',
    endTime: '21:30',
    basePrice: 500,
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 42,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
  {
    id: 'evt-005',
    organizerId: 'usr-demo-organizer-02',
    title: 'Broadway Musical Gala',
    description: 'An unforgettable musical theater experience celebrating iconic showstoppers from Broadway and West End.',
    category: 'THEATER',
    venue: 'University Theater House',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 15).toISOString(),
    startTime: '19:30',
    endTime: '22:00',
    basePrice: 950,
    imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 30,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
  {
    id: 'evt-006',
    organizerId: 'usr-demo-organizer-02',
    title: 'University Derby Football Championship',
    description: 'The monumental rivalry game between the Tech Warriors and the State Lions. Bragging rights on the line!',
    category: 'SPORTS',
    venue: 'University Stadium',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 8).toISOString(),
    startTime: '16:00',
    endTime: '19:00',
    basePrice: 750,
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 45,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
  {
    id: 'evt-007',
    organizerId: 'usr-demo-organizer-02',
    title: 'Inter-College Basketball Final',
    description: 'High-octane hoops action determining the collegiate regional champions. Intense buzzer-beaters guaranteed.',
    category: 'SPORTS',
    venue: 'Indoor Sports Complex',
    city: 'Boston',
    date: new Date(Date.now() + 86400000 * 10).toISOString(),
    startTime: '17:00',
    endTime: '19:30',
    basePrice: 450,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000&auto=format&fit=crop&q=80',
    totalCapacity: 50,
    ticketsSold: 28,
    status: 'UPCOMING',
    organizer: {
      id: 'usr-demo-organizer-02',
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
    },
  },
];

export const generateMockSeats = (eventId: string, basePrice: number): Seat[] => {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seats: Seat[] = [];

  // Consistent pseudo-random sold/locked seats for demo
  const soldSeatsForEvent: Record<string, string[]> = {
    'evt-001': ['A1', 'A2', 'A5', 'B3', 'B4', 'C1', 'C2', 'C7', 'C8', 'D5', 'D6', 'E1', 'E2'],
    'evt-004': ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B5', 'C3', 'C4', 'D1', 'D2', 'E4', 'E5'],
    'evt-006': ['A1', 'A2', 'A3', 'A4', 'A5', 'B1', 'B2', 'B3', 'C1', 'C2', 'D1', 'E1', 'E2'],
  };

  const lockedSeatsForEvent: Record<string, string[]> = {
    'evt-001': ['A3', 'B8'],
    'evt-002': ['C4'],
  };

  const sold = soldSeatsForEvent[eventId] || ['A1', 'B2', 'C3'];
  const locked = lockedSeatsForEvent[eventId] || ['B5'];

  for (const r of rows) {
    for (let s = 1; s <= 10; s++) {
      const seatNum = `${r}${s}`;
      let status: 'AVAILABLE' | 'LOCKED' | 'SOLD' = 'AVAILABLE';
      if (sold.includes(seatNum)) status = 'SOLD';
      else if (locked.includes(seatNum)) status = 'LOCKED';

      seats.push({
        id: `seat-${eventId}-${seatNum}`,
        eventId,
        seatNumber: seatNum,
        row: r,
        section: 'MAIN',
        status,
        price: basePrice,
      });
    }
  }

  return seats;
};

export const calculateMockPricing = (event: EventItem): PricingDetails => {
  const basePrice = event.basePrice;
  const capacity = event.totalCapacity || 50;
  const sold = event.ticketsSold || 0;
  const occupancyPercentage = Math.round((sold / capacity) * 100);

  let multiplier = 1.0;
  const factors: string[] = [];

  if (occupancyPercentage >= 90) {
    multiplier += 0.40;
    factors.push('VERY_HIGH_DEMAND');
  } else if (occupancyPercentage >= 80) {
    multiplier += 0.25;
    factors.push('HIGH_DEMAND');
  } else if (occupancyPercentage >= 50) {
    multiplier += 0.10;
    factors.push('MODERATE_DEMAND');
  } else {
    factors.push('STANDARD_PRICING');
  }

  const now = new Date();
  const eventTime = new Date(event.date);
  const hoursUntil = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil > 0 && hoursUntil <= 72) {
    multiplier += 0.10;
    factors.push('LAST_MINUTE_SURGE');
  }

  const currentPrice = Math.round(basePrice * multiplier);

  return {
    event_id: event.id,
    base_price: basePrice,
    current_price: currentPrice,
    occupancy_percentage: occupancyPercentage,
    pricing_factors: factors,
  };
};

export const MOCK_SESSIONS: UserSession[] = [
  {
    id: 'sess-001',
    deviceName: 'Chrome — Windows 11',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    loginTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastActive: new Date().toISOString(),
    revoked: false,
    isCurrent: true,
  },
  {
    id: 'sess-002',
    deviceName: 'Chrome — Linux (Ubuntu)',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 minutes ago
    revoked: false,
    isCurrent: false,
  },
  {
    id: 'sess-003',
    deviceName: 'Safari — iPhone 15 Pro',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    loginTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    revoked: false,
    isCurrent: false,
  },
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-demo-audience-01',
    title: '🎟 Booking Confirmed',
    message: 'Your tickets for Grand Symphony Orchestra have been confirmed. View your QR ticket now.',
    type: 'BOOKING_CONFIRMED',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'usr-demo-audience-01',
    title: '⚡ Seat Lock Active',
    message: 'Your seat selection is reserved for 5 minutes. Complete checkout before expiration.',
    type: 'SEAT_LOCKED',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'usr-demo-audience-01',
    title: '📢 Event Reminder',
    message: 'Shakespeare in the Park starts in 3 days. Venue doors open at 17:30.',
    type: 'EVENT_REMINDER',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];

export const MOCK_ANALYTICS_OVERVIEW: AnalyticsOverview = {
  totalRevenue: 348500,
  ticketsSold: 217,
  bookingsCount: 94,
  activeEvents: 7,
  avgTicketPrice: 1605.99,
  occupancyPercentage: 62,
};

export const MOCK_EVENT_ANALYTICS: EventAnalyticsItem[] = [
  {
    eventId: 'evt-001',
    title: 'Grand Symphony Orchestra',
    category: 'CONCERT',
    ticketsSold: 38,
    totalCapacity: 50,
    occupancyPercentage: 76,
    estimatedRevenue: 45600,
    status: 'UPCOMING',
  },
  {
    eventId: 'evt-002',
    title: 'Rock Fest 2026',
    category: 'CONCERT',
    ticketsSold: 22,
    totalCapacity: 50,
    occupancyPercentage: 44,
    estimatedRevenue: 17600,
    status: 'UPCOMING',
  },
  {
    eventId: 'evt-003',
    title: 'Electronic Beats Night',
    category: 'CONCERT',
    ticketsSold: 15,
    totalCapacity: 50,
    occupancyPercentage: 30,
    estimatedRevenue: 9000,
    status: 'UPCOMING',
  },
  {
    eventId: 'evt-004',
    title: 'Shakespeare in the Park: Hamlet',
    category: 'THEATER',
    ticketsSold: 42,
    totalCapacity: 50,
    occupancyPercentage: 84,
    estimatedRevenue: 21000,
    status: 'UPCOMING',
  },
  {
    eventId: 'evt-005',
    title: 'Broadway Musical Gala',
    category: 'THEATER',
    ticketsSold: 30,
    totalCapacity: 50,
    occupancyPercentage: 60,
    estimatedRevenue: 28500,
    status: 'UPCOMING',
  },
  {
    eventId: 'evt-006',
    title: 'University Derby Football Championship',
    category: 'SPORTS',
    ticketsSold: 45,
    totalCapacity: 50,
    occupancyPercentage: 90,
    estimatedRevenue: 33750,
    status: 'UPCOMING',
  },
  {
    eventId: 'evt-007',
    title: 'Inter-College Basketball Final',
    category: 'SPORTS',
    ticketsSold: 28,
    totalCapacity: 50,
    occupancyPercentage: 56,
    estimatedRevenue: 12600,
    status: 'UPCOMING',
  },
];

export const MOCK_REVENUE_ANALYTICS: RevenueDataPoint[] = [
  { date: '2026-09-01', revenue: 24500 },
  { date: '2026-09-02', revenue: 38200 },
  { date: '2026-09-03', revenue: 42100 },
  { date: '2026-09-04', revenue: 51800 },
  { date: '2026-09-05', revenue: 64900 },
  { date: '2026-09-06', revenue: 58200 },
  { date: '2026-09-07', revenue: 68800 },
];

export const MOCK_HEALTH: ServiceHealthReport = {
  gateway: 'healthy',
  services: {
    auth: 'healthy',
    events: 'healthy',
    booking: 'healthy',
    pricing: 'healthy',
    analytics: 'healthy',
    notifications: 'healthy',
    redis: 'healthy',
    postgres: 'healthy',
  },
};
