import { apiClient } from './client';
import { PricingDetails } from '../types';
import { INITIAL_EVENTS, calculateMockPricing } from './mockData';

export const pricingApi = {
  async getEventPrice(eventId: string): Promise<PricingDetails> {
    try {
      const { data } = await apiClient.get<PricingDetails>(`/pricing/${eventId}`);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Pricing] Backend offline, calculating dynamic price client-side');
        const event = INITIAL_EVENTS.find((e) => e.id === eventId) || INITIAL_EVENTS[0];
        return calculateMockPricing(event);
      }
      throw error;
    }
  },
};
