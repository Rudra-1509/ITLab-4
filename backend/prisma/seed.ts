import { PrismaClient, Role, EventCategory, EventStatus, SeatStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.processedEvent.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.bookingSeat.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.event.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Demo Users
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@example.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const organizer = await prisma.user.create({
    data: {
      name: 'Campus Event Organizer',
      email: 'organizer@example.com',
      passwordHash,
      role: Role.ORGANIZER,
    },
  });

  const audience = await prisma.user.create({
    data: {
      name: 'John Audience',
      email: 'user@example.com',
      passwordHash,
      role: Role.AUDIENCE,
    },
  });

  console.log('Demo Users created: admin@example.com, organizer@example.com, user@example.com');

  // 2. Create 7 Realistic Events
  const eventTemplates = [
    // 3 Concerts
    {
      title: 'Grand Symphony Orchestra',
      description: 'An evening of majestic classical music performed by the university symphony orchestra.',
      category: EventCategory.CONCERT,
      venue: 'Auditorium Main Hall',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 5), // in 5 days
      startTime: '19:00',
      endTime: '22:00',
      basePrice: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
    },
    {
      title: 'Rock Fest 2026',
      description: 'High energy rock and indie bands live on stage with full light show.',
      category: EventCategory.CONCERT,
      venue: 'Campus Open Field',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 12),
      startTime: '18:00',
      endTime: '23:00',
      basePrice: 800,
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
    },
    {
      title: 'Electronic Beats Night',
      description: 'Sub-zero basslines and synth melodies featuring top student DJs.',
      category: EventCategory.CONCERT,
      venue: 'Student Union Arena',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 20),
      startTime: '21:00',
      endTime: '02:00',
      basePrice: 600,
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'
    },

    // 2 Theater Events
    {
      title: 'Shakespeare in the Park: Hamlet',
      description: 'A classic drama performance in the central campus amphitheater.',
      category: EventCategory.THEATER,
      venue: 'Central Amphitheater',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 3),
      startTime: '18:30',
      endTime: '21:30',
      basePrice: 500,
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800'
    },
    {
      title: 'Broadway Musical Gala',
      description: 'A musical theater spectacle featuring hit songs from timeless musicals.',
      category: EventCategory.THEATER,
      venue: 'University Theater House',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 15),
      startTime: '19:30',
      endTime: '22:00',
      basePrice: 950,
      imageUrl: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800'
    },

    // 2 Sports Events
    {
      title: 'University Derby Football Championship',
      description: 'The annual rivalry clash between Tech Warriors and State Lions.',
      category: EventCategory.SPORTS,
      venue: 'University Stadium',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 8),
      startTime: '16:00',
      endTime: '19:00',
      basePrice: 750,
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'
    },
    {
      title: 'Inter-College Basketball Final',
      description: 'High stakes basketball championship game deciding the regional title.',
      category: EventCategory.SPORTS,
      venue: 'Indoor Sports Complex',
      city: 'Boston',
      date: new Date(Date.now() + 86400000 * 10),
      startTime: '17:00',
      endTime: '19:30',
      basePrice: 450,
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'
    }
  ];

  const createdEvents = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];

  for (const tpl of eventTemplates) {
    const event = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        title: tpl.title,
        description: tpl.description,
        category: tpl.category,
        venue: tpl.venue,
        city: tpl.city,
        date: tpl.date,
        startTime: tpl.startTime,
        endTime: tpl.endTime,
        imageUrl: tpl.imageUrl,
        totalCapacity: 50,
        ticketsSold: 0,
        basePrice: tpl.basePrice,
        status: EventStatus.UPCOMING
      }
    });

    // Generate Seats (A1-A10, B1-B10, C1-C10, D1-D10, E1-E10)
    const seatsData = [];
    for (let r = 0; r < rows.length; r++) {
      for (let s = 1; s <= 10; s++) {
        seatsData.push({
          eventId: event.id,
          seatNumber: `${rows[r]}${s}`,
          row: rows[r],
          section: 'MAIN',
          status: SeatStatus.AVAILABLE,
          price: tpl.basePrice,
        });
      }
    }
    await prisma.seat.createMany({ data: seatsData });

    // Pricing rule
    await prisma.pricingRule.create({
      data: {
        eventId: event.id,
        ruleType: 'HIGH_DEMAND',
        threshold: 80,
        percentageChange: 25,
        active: true
      }
    });

    createdEvents.push(event);
  }

  console.log(`Created ${createdEvents.length} events with 50 seats each.`);

  // 3. Create Sample Bookings & Tickets for Analytics Demo
  const demoEvent = createdEvents[0];
  const demoSeats = await prisma.seat.findMany({
    where: { eventId: demoEvent.id },
    take: 5
  });

  const sampleBooking = await prisma.booking.create({
    data: {
      userId: audience.id,
      eventId: demoEvent.id,
      totalAmount: demoEvent.basePrice * 2,
      status: 'CONFIRMED'
    }
  });

  await prisma.bookingSeat.createMany({
    data: [
      { bookingId: sampleBooking.id, seatId: demoSeats[0].id, price: demoEvent.basePrice },
      { bookingId: sampleBooking.id, seatId: demoSeats[1].id, price: demoEvent.basePrice }
    ]
  });

  await prisma.seat.updateMany({
    where: { id: { in: [demoSeats[0].id, demoSeats[1].id] } },
    data: { status: SeatStatus.SOLD }
  });

  await prisma.event.update({
    where: { id: demoEvent.id },
    data: { ticketsSold: 2 }
  });

  const tCode1 = `TICK-${randomUUID().substring(0, 8).toUpperCase()}`;
  const tCode2 = `TICK-${randomUUID().substring(0, 8).toUpperCase()}`;

  await prisma.ticket.createMany({
    data: [
      {
        bookingId: sampleBooking.id,
        userId: audience.id,
        eventId: demoEvent.id,
        seatId: demoSeats[0].id,
        ticketCode: tCode1,
        qrCode: await QRCode.toDataURL(tCode1),
        price: demoEvent.basePrice,
        status: 'VALID'
      },
      {
        bookingId: sampleBooking.id,
        userId: audience.id,
        eventId: demoEvent.id,
        seatId: demoSeats[1].id,
        ticketCode: tCode2,
        qrCode: await QRCode.toDataURL(tCode2),
        price: demoEvent.basePrice,
        status: 'VALID'
      }
    ]
  });

  await prisma.notification.create({
    data: {
      userId: audience.id,
      title: 'Booking Confirmed',
      message: `Your ticket booking for "${demoEvent.title}" has been confirmed!`,
      type: 'BOOKING_CONFIRMED',
      read: false
    }
  });

  await prisma.analyticsEvent.create({
    data: {
      eventId: demoEvent.id,
      userId: audience.id,
      eventType: 'PAYMENT_SUCCEEDED',
      amount: sampleBooking.totalAmount,
      metadata: { bookingId: sampleBooking.id }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
