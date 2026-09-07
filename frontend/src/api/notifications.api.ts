import { apiClient } from './client';
import { NotificationItem } from '../types';
import { MOCK_NOTIFICATIONS } from './mockData';

let localNotifs: NotificationItem[] = [...MOCK_NOTIFICATIONS];

export const notificationsApi = {
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    try {
      const { data } = await apiClient.get<{
        notifications: NotificationItem[];
        unreadCount: number;
      }>('/notifications');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Notifications] Backend offline, returning fallback notifications');
        const unreadCount = localNotifs.filter((n) => !n.read).length;
        return { notifications: localNotifs, unreadCount };
      }
      throw error;
    }
  },

  async markAsRead(id: string): Promise<{ notification: NotificationItem }> {
    try {
      const { data } = await apiClient.patch<{ notification: NotificationItem }>(
        `/notifications/${id}/read`
      );
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        localNotifs = localNotifs.map((n) => (n.id === id ? { ...n, read: true } : n));
        const found = localNotifs.find((n) => n.id === id)!;
        return { notification: found };
      }
      throw error;
    }
  },

  addMockNotification(title: string, message: string, type: string) {
    localNotifs.unshift({
      id: `notif-${Date.now()}`,
      userId: 'usr-demo-audience-01',
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    });
  },
};
