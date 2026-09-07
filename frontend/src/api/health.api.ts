import { apiClient } from './client';
import { ServiceHealthReport } from '../types';
import { MOCK_HEALTH } from './mockData';

export const healthApi = {
  async getHealth(): Promise<ServiceHealthReport> {
    try {
      const { data } = await apiClient.get<ServiceHealthReport>('/health');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Health] Backend offline, returning demo health report');
        return MOCK_HEALTH;
      }
      throw error;
    }
  },
};
