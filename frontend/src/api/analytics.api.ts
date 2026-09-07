import { apiClient } from './client';
import { AnalyticsOverview, EventAnalyticsItem, RevenueDataPoint } from '../types';
import {
  MOCK_ANALYTICS_OVERVIEW,
  MOCK_EVENT_ANALYTICS,
  MOCK_REVENUE_ANALYTICS,
} from './mockData';

export const analyticsApi = {
  async getOverview(): Promise<{ overview: AnalyticsOverview }> {
    try {
      const { data } = await apiClient.get<{ overview: AnalyticsOverview }>('/analytics/overview');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Analytics] Backend offline, returning fallback overview data');
        return { overview: MOCK_ANALYTICS_OVERVIEW };
      }
      throw error;
    }
  },

  async getEventAnalytics(): Promise<{ events: EventAnalyticsItem[] }> {
    try {
      const { data } = await apiClient.get<{ events: EventAnalyticsItem[] }>('/analytics/events');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Analytics] Backend offline, returning fallback event analytics');
        return { events: MOCK_EVENT_ANALYTICS };
      }
      throw error;
    }
  },

  async getRevenueAnalytics(): Promise<{ salesOverTime: RevenueDataPoint[] }> {
    try {
      const { data } = await apiClient.get<{ salesOverTime: RevenueDataPoint[] }>(
        '/analytics/revenue'
      );
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Analytics] Backend offline, returning fallback revenue analytics');
        return { salesOverTime: MOCK_REVENUE_ANALYTICS };
      }
      throw error;
    }
  },
};
