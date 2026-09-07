import { prisma } from '../../../../shared/prisma/client.js';
import { NotFoundError } from '../../../../shared/errors/custom-error.js';

export class PricingService {
  static async calculateEventPrice(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new NotFoundError('Event not found', 'EVENT_NOT_FOUND');
    }

    const basePrice = event.basePrice;
    const capacity = event.totalCapacity || 1;
    const sold = event.ticketsSold || 0;
    const occupancyPercentage = Math.round((sold / capacity) * 100);

    let priceMultiplier = 1.0;
    const pricingFactors: string[] = [];

    if (occupancyPercentage >= 90) {
      priceMultiplier += 0.40;
      pricingFactors.push('VERY_HIGH_DEMAND');
    } else if (occupancyPercentage >= 80) {
      priceMultiplier += 0.25;
      pricingFactors.push('HIGH_DEMAND');
    } else if (occupancyPercentage >= 50) {
      priceMultiplier += 0.10;
      pricingFactors.push('MODERATE_DEMAND');
    } else {
      pricingFactors.push('STANDARD_PRICING');
    }

    // Proximity factor: event starts within 24 hours
    const now = new Date();
    const eventTime = new Date(event.date);
    const hoursUntilEvent = (eventTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilEvent > 0 && hoursUntilEvent <= 24) {
      priceMultiplier += 0.10;
      pricingFactors.push('LAST_MINUTE_SURGE');
    }

    const currentPrice = Math.round(basePrice * priceMultiplier * 100) / 100;

    return {
      event_id: event.id,
      base_price: basePrice,
      current_price: currentPrice,
      occupancy_percentage: occupancyPercentage,
      pricing_factors: pricingFactors
    };
  }
}
