import { prisma } from '../../../../shared/prisma/client.js';

export class AnalyticsService {
  static async getOverview(userId: string, role: string) {
    const isOrganizer = role === 'ORGANIZER';
    const eventFilter = isOrganizer ? { organizerId: userId } : {};

    const events = await prisma.event.findMany({
      where: eventFilter,
      select: {
        id: true,
        ticketsSold: true,
        totalCapacity: true,
        basePrice: true,
        status: true
      }
    });

    const activeEventsCount = events.filter((e: { status: string; }) => e.status !== 'CANCELLED').length;
    const totalTicketsSold = events.reduce((sum: number, e: { ticketsSold: number; }) => sum + e.ticketsSold, 0);
    const totalCapacity = events.reduce((sum: number, e: { totalCapacity: number; }) => sum + (e.totalCapacity || 50), 0);
    const occupancyPercentage = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

    // Calculate revenue from confirmed bookings
    const confirmedBookingsFilter: any = { status: 'CONFIRMED' };
    if (isOrganizer) {
      confirmedBookingsFilter.event = { organizerId: userId };
    }

    const confirmedBookings = await prisma.booking.findMany({
      where: confirmedBookingsFilter,
      select: { totalAmount: true }
    });

    const totalRevenue = confirmedBookings.reduce((sum: number, b: { totalAmount: number; }) => sum + b.totalAmount, 0);
    const bookingsCount = confirmedBookings.length;
    const avgTicketPrice = totalTicketsSold > 0 ? Math.round((totalRevenue / totalTicketsSold) * 100) / 100 : 0;

    return {
      overview: {
        totalRevenue,
        ticketsSold: totalTicketsSold,
        bookingsCount,
        activeEvents: activeEventsCount,
        avgTicketPrice,
        occupancyPercentage
      }
    };
  }

  static async getEventAnalytics(userId: string, role: string) {
    const isOrganizer = role === 'ORGANIZER';
    const eventFilter = isOrganizer ? { organizerId: userId } : {};

    const events = await prisma.event.findMany({
      where: eventFilter,
      include: {
        _count: {
          select: { bookings: true, tickets: true }
        }
      }
    });

    const eventStats = events.map((event: any) => {
      const occupancy = event.totalCapacity ? Math.round((event.ticketsSold / event.totalCapacity) * 100) : 0;
      const totalRevenue = event.ticketsSold * event.basePrice; // base minimum revenue estimate

      return {
        eventId: event.id,
        title: event.title,
        category: event.category,
        ticketsSold: event.ticketsSold,
        totalCapacity: event.totalCapacity,
        occupancyPercentage: occupancy,
        estimatedRevenue: totalRevenue,
        status: event.status
      };
    });

    return { events: eventStats };
  }

  static async getRevenueAnalytics(userId: string, role: string) {
    const isOrganizer = role === 'ORGANIZER';
    const filter: any = { eventType: 'PAYMENT_SUCCEEDED' };

    const analyticsEvents = await prisma.analyticsEvent.findMany({
      where: filter,
      orderBy: { createdAt: 'asc' }
    });

    const revenueByDate: Record<string, number> = {};

    for (const evt of analyticsEvents) {
      const dateStr = evt.createdAt.toISOString().split('T')[0];
      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + (evt.amount || 0);
    }

    const salesOverTime = Object.keys(revenueByDate).map((date) => ({
      date,
      revenue: revenueByDate[date]
    }));

    return { salesOverTime };
  }
}
