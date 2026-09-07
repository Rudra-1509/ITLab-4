import request from 'supertest';
import bookingApp from '../services/bookings/src/index.js';
import { redis, getSeatLockKey, disconnectRedis } from '../shared/redis/client.js';
import { signToken } from '../shared/auth/jwt.js';
import { prisma } from '../shared/prisma/client.js';

describe('CRITICAL CONCURRENCY TEST: Redis Seat Locking', () => {
  const dummyOrganizerId = '10000000-0000-0000-0000-000000000000';
  const dummyUserIdA = '20000000-0000-0000-0000-000000000000';
  const dummyUserIdB = '30000000-0000-0000-0000-000000000000';
  const dummySessIdA = 'sess-concurrency-a';
  const dummySessIdB = 'sess-concurrency-b';
  const dummyEventId = '11111111-1111-1111-1111-111111111111';
  const dummySeatId = '22222222-2222-2222-2222-222222222222';

  const userAToken = signToken({ userId: dummyUserIdA, email: 'usera@example.com', role: 'AUDIENCE', sessionId: dummySessIdA });
  const userBToken = signToken({ userId: dummyUserIdB, email: 'userb@example.com', role: 'AUDIENCE', sessionId: dummySessIdB });

  beforeAll(async () => {
    // Ensure lock is cleared before testing
    const lockKey = getSeatLockKey(dummyEventId, dummySeatId);
    await redis.del(lockKey);

    // Setup organizer
    await prisma.user.upsert({
      where: { id: dummyOrganizerId },
      update: {},
      create: {
        id: dummyOrganizerId,
        name: 'Concurrency Organizer',
        email: 'concurrency-organizer@example.com',
        passwordHash: 'dummyhash',
        role: 'ORGANIZER'
      }
    });

    // Setup User A & Session A
    await prisma.user.upsert({
      where: { id: dummyUserIdA },
      update: {},
      create: {
        id: dummyUserIdA,
        name: 'User A',
        email: 'usera@example.com',
        passwordHash: 'dummyhash',
        role: 'AUDIENCE'
      }
    });

    await prisma.userSession.upsert({
      where: { id: dummySessIdA },
      update: { revoked: false },
      create: {
        id: dummySessIdA,
        userId: dummyUserIdA,
        revoked: false
      }
    });

    // Setup User B & Session B
    await prisma.user.upsert({
      where: { id: dummyUserIdB },
      update: {},
      create: {
        id: dummyUserIdB,
        name: 'User B',
        email: 'userb@example.com',
        passwordHash: 'dummyhash',
        role: 'AUDIENCE'
      }
    });

    await prisma.userSession.upsert({
      where: { id: dummySessIdB },
      update: { revoked: false },
      create: {
        id: dummySessIdB,
        userId: dummyUserIdB,
        revoked: false
      }
    });

    // Setup Event & Seat
    await prisma.event.upsert({
      where: { id: dummyEventId },
      update: {},
      create: {
        id: dummyEventId,
        organizerId: dummyOrganizerId,
        title: 'Concurrency Test Event',
        description: 'Testing Redis atomic seat locks',
        category: 'CONCERT',
        venue: 'Grand Hall',
        city: 'Metropolis',
        date: new Date(Date.now() + 86400000),
        startTime: '19:00',
        endTime: '22:00',
        totalCapacity: 100,
        basePrice: 50
      }
    });

    await prisma.seat.upsert({
      where: { id: dummySeatId },
      update: { status: 'AVAILABLE' },
      create: {
        id: dummySeatId,
        eventId: dummyEventId,
        seatNumber: 'CONC-SEAT-1',
        row: 'A',
        section: 'VIP',
        status: 'AVAILABLE',
        price: 50
      }
    });
  });

  afterAll(async () => {
    const lockKey = getSeatLockKey(dummyEventId, dummySeatId);
    await redis.del(lockKey);

    await prisma.seat.deleteMany({ where: { id: dummySeatId } });
    await prisma.event.deleteMany({ where: { id: dummyEventId } });
    await prisma.userSession.deleteMany({ where: { id: { in: [dummySessIdA, dummySessIdB] } } });
    await prisma.user.deleteMany({ where: { id: { in: [dummyUserIdA, dummyUserIdB, dummyOrganizerId] } } });

    await prisma.$disconnect();
    await disconnectRedis();
  });

  it('should allow only one user to lock the seat concurrently and return 409 to the second user', async () => {
    // Execute simultaneous HTTP requests for the exact same seat
    const [resA, resB] = await Promise.all([
      request(bookingApp)
        .post('/api/bookings/lock')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ eventId: dummyEventId, seatId: dummySeatId }),
      request(bookingApp)
        .post('/api/bookings/lock')
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ eventId: dummyEventId, seatId: dummySeatId })
    ]);

    const statuses = [resA.status, resB.status].sort();

    // Expect exactly one 200 OK and one 409 Conflict
    expect(statuses).toEqual([200, 409]);

    const conflictResponse = resA.status === 409 ? resA.body : resB.body;
    expect(conflictResponse.error).toBeDefined();
    expect(conflictResponse.error.code).toBe('SEAT_UNAVAILABLE');
    expect(conflictResponse.error.message).toContain('locked or sold');
  });
});
