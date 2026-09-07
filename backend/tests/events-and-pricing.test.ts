import request from 'supertest';
import eventApp from '../services/events/src/index.js';
import pricingApp from '../services/pricing/src/index.js';
import { prisma } from '../shared/prisma/client.js';
import { signToken } from '../shared/auth/jwt.js';
import { disconnectRedis } from '../shared/redis/client.js';

describe('EVENT LIFECYCLE & DYNAMIC PRICING TESTS', () => {
  const organizerId = '40000000-0000-0000-0000-000000000000';
  const sessionId = 'sess-events-test-1';
  let createdEventId: string;

  const organizerToken = signToken({
    userId: organizerId,
    email: 'event-organizer@example.com',
    role: 'ORGANIZER',
    sessionId
  });

  beforeAll(async () => {
    // Setup organizer user and active session in database
    await prisma.user.upsert({
      where: { id: organizerId },
      update: {},
      create: {
        id: organizerId,
        name: 'Event Organizer Tester',
        email: 'event-organizer@example.com',
        passwordHash: 'dummyhash',
        role: 'ORGANIZER'
      }
    });

    await prisma.userSession.upsert({
      where: { id: sessionId },
      update: { revoked: false },
      create: {
        id: sessionId,
        userId: organizerId,
        revoked: false
      }
    });
  });

  afterAll(async () => {
    if (createdEventId) {
      await prisma.seat.deleteMany({ where: { eventId: createdEventId } });
      await prisma.event.deleteMany({ where: { id: createdEventId } });
    }
    await prisma.userSession.deleteMany({ where: { id: sessionId } });
    await prisma.user.deleteMany({ where: { id: organizerId } });
    await prisma.$disconnect();
    await disconnectRedis();
  });

  it('should create an event and automatically generate 50 seats', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 3); // 3 days in future

    const createRes = await request(eventApp)
      .post('/api/events')
      .set('Authorization', `Bearer ${organizerToken}`)
      .send({
        title: 'Symphony Under the Stars',
        description: 'An open-air classical orchestra experience.',
        category: 'CONCERT',
        venue: 'Campus Amphitheater',
        city: 'Boston',
        date: futureDate.toISOString(),
        startTime: '19:00',
        endTime: '22:00',
        basePrice: 100,
        totalCapacity: 50
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.event).toBeDefined();
    expect(createRes.body.event.title).toBe('Symphony Under the Stars');
    createdEventId = createRes.body.event.id;

    // Verify seats were auto-generated
    const seatsRes = await request(eventApp).get(`/api/events/${createdEventId}/seats`);
    expect(seatsRes.status).toBe(200);
    expect(seatsRes.body.seats).toBeDefined();
    expect(seatsRes.body.seats.length).toBe(50);

    // Verify row structure A-E
    const rows = new Set(seatsRes.body.seats.map((s: any) => s.row));
    expect(rows).toEqual(new Set(['A', 'B', 'C', 'D', 'E']));
  });

  it('should query events with search and category filters', async () => {
    const listRes = await request(eventApp)
      .get('/api/events')
      .query({ category: 'CONCERT', search: 'Symphony' });

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.events)).toBe(true);
    expect(listRes.body.events.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body.events[0].category).toBe('CONCERT');
  });

  it('should compute standard pricing when occupancy is 0%', async () => {
    const priceRes = await request(pricingApp).get(`/api/pricing/${createdEventId}`);
    expect(priceRes.status).toBe(200);
    expect(priceRes.body.event_id).toBe(createdEventId);
    expect(priceRes.body.base_price).toBe(100);
    expect(priceRes.body.current_price).toBe(100);
    expect(priceRes.body.occupancy_percentage).toBe(0);
    expect(priceRes.body.pricing_factors).toContain('STANDARD_PRICING');
  });

  it('should apply dynamic surge pricing when occupancy reaches high demand threshold', async () => {
    // Simulate 42 out of 50 seats sold = 84% occupancy (High Demand tier: +25%)
    await prisma.event.update({
      where: { id: createdEventId },
      data: { ticketsSold: 42 }
    });

    const priceRes = await request(pricingApp).get(`/api/pricing/${createdEventId}`);
    expect(priceRes.status).toBe(200);
    expect(priceRes.body.occupancy_percentage).toBe(84);
    // Base 100 * 1.25 = 125
    expect(priceRes.body.current_price).toBe(125);
    expect(priceRes.body.pricing_factors).toContain('HIGH_DEMAND');
  });
});
