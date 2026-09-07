import { prisma } from '../../../../shared/prisma/client.js';
import { redis, getSeatLockKey } from '../../../../shared/redis/client.js';
import { CreateEventInput, UpdateEventInput } from '../schemas/event.schema.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../../../shared/errors/custom-error.js';
import { publishEvent } from '../../../../shared/events/stream.js';
import { EventCategory } from '../../../../shared/types/index.js';

export class EventService {
  static async createEvent(organizerId: string, input: CreateEventInput) {
    const totalCapacity = input.totalCapacity || 50;

    const event = await prisma.event.create({
      data: {
        organizerId,
        title: input.title,
        description: input.description,
        category: input.category as EventCategory,
        venue: input.venue,
        city: input.city,
        date: new Date(input.date),
        startTime: input.startTime,
        endTime: input.endTime,
        imageUrl: input.imageUrl,
        totalCapacity,
        basePrice: input.basePrice,
      }
    });

    // Auto-generate seats: 5 rows (A, B, C, D, E), 10 seats per row = 50 seats
    const rows = ['A', 'B', 'C', 'D', 'E'];
    const seatsData = [];

    for (let r = 0; r < rows.length; r++) {
      const rowLetter = rows[r];
      for (let s = 1; s <= 10; s++) {
        seatsData.push({
          eventId: event.id,
          seatNumber: `${rowLetter}${s}`,
          row: rowLetter,
          section: 'MAIN',
          status: 'AVAILABLE' as const,
          price: input.basePrice,
        });
      }
    }

    await prisma.seat.createMany({
      data: seatsData
    });

    await publishEvent('EVENT_CREATED', 'event-service', {
      eventId: event.id,
      title: event.title,
      organizerId: event.organizerId,
      basePrice: event.basePrice
    });

    return { event };
  }

  static async getEvents(query: { category?: string; city?: string; search?: string }) {
    const where: any = {
      status: { not: 'CANCELLED' }
    };

    if (query.category) {
      where.category = query.category;
    }
    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { venue: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return { events };
  }

  static async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    return { event };
  }

  static async updateEvent(eventId: string, organizerId: string, role: string, input: UpdateEventInput) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    if (role !== 'ADMIN' && event.organizerId !== organizerId) {
      throw new ForbiddenError('Only the organizer or admin can edit this event', 'NOT_EVENT_OWNER');
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...input,
        date: input.date ? new Date(input.date) : undefined,
        category: input.category as EventCategory | undefined
      }
    });

    return { event: updated };
  }

  static async deleteEvent(eventId: string, organizerId: string, role: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    if (role !== 'ADMIN' && event.organizerId !== organizerId) {
      throw new ForbiddenError('Only the organizer or admin can cancel this event', 'NOT_EVENT_OWNER');
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: { status: 'CANCELLED' }
    });

    return { message: 'Event cancelled successfully', event: updated };
  }

  static async getEventSeats(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    const seats = await prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ row: 'asc' }, { seatNumber: 'asc' }]
    });

    // Cross check with Redis lock keys
    const enrichedSeats = await Promise.all(
      seats.map(async (seat) => {
        let status = seat.status;
        if (status === 'AVAILABLE') {
          const lockKey = getSeatLockKey(eventId, seat.id);
          const isLocked = await redis.get(lockKey);
          if (isLocked) {
            status = 'LOCKED';
          }
        }
        return {
          ...seat,
          status
        };
      })
    );

    return { eventId, totalSeats: enrichedSeats.length, seats: enrichedSeats };
  }
}
