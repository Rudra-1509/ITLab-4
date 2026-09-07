import { apiClient } from './client';
import { EventItem, SeatMapResponse, EventCategory } from '../types';
import { INITIAL_EVENTS, generateMockSeats } from './mockData';

export interface EventQueryParams {
  category?: string;
  city?: string;
  search?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  category: EventCategory;
  venue: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  imageUrl?: string;
  totalCapacity?: number;
}

// In-memory events store for offline demonstration
let localEvents: EventItem[] = [...INITIAL_EVENTS];

export const eventsApi = {
  async getEvents(params?: EventQueryParams): Promise<{ events: EventItem[] }> {
    try {
      const { data } = await apiClient.get<{ events: EventItem[] }>('/events', { params });
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Events] Backend offline, using demo events fallback');
        let filtered = [...localEvents];
        if (params?.category && params.category !== 'ALL') {
          filtered = filtered.filter((e) => e.category === params.category);
        }
        if (params?.city && params.city !== 'ALL') {
          filtered = filtered.filter((e) =>
            e.city.toLowerCase().includes(params.city!.toLowerCase())
          );
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              e.venue.toLowerCase().includes(q)
          );
        }
        return { events: filtered };
      }
      throw error;
    }
  },

  async getEventById(eventId: string): Promise<{ event: EventItem }> {
    try {
      const { data } = await apiClient.get<{ event: EventItem }>(`/events/${eventId}`);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const found = localEvents.find((e) => e.id === eventId) || localEvents[0];
        return { event: found };
      }
      throw error;
    }
  },

  async getEventSeats(eventId: string): Promise<SeatMapResponse> {
    try {
      const { data } = await apiClient.get<SeatMapResponse>(`/events/${eventId}/seats`);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const event = localEvents.find((e) => e.id === eventId) || localEvents[0];
        const seats = generateMockSeats(eventId, event.basePrice);
        return {
          eventId,
          totalSeats: seats.length,
          seats,
        };
      }
      throw error;
    }
  },

  async createEvent(payload: CreateEventPayload): Promise<{ event: EventItem }> {
    try {
      const { data } = await apiClient.post<{ event: EventItem }>('/events', payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const newEvent: EventItem = {
          id: `evt-${Date.now()}`,
          organizerId: 'usr-demo-organizer-02',
          title: payload.title,
          description: payload.description,
          category: payload.category,
          venue: payload.venue,
          city: payload.city,
          date: payload.date,
          startTime: payload.startTime,
          endTime: payload.endTime,
          basePrice: payload.basePrice,
          imageUrl:
            payload.imageUrl ||
            'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1000&auto=format&fit=crop&q=80',
          totalCapacity: payload.totalCapacity || 50,
          ticketsSold: 0,
          status: 'UPCOMING',
          createdAt: new Date().toISOString(),
          organizer: {
            id: 'usr-demo-organizer-02',
            name: 'Campus Event Organizer',
            email: 'organizer@example.com',
          },
        };
        localEvents = [newEvent, ...localEvents];
        return { event: newEvent };
      }
      throw error;
    }
  },

  async updateEvent(
    eventId: string,
    payload: Partial<CreateEventPayload>
  ): Promise<{ event: EventItem }> {
    try {
      const { data } = await apiClient.put<{ event: EventItem }>(`/events/${eventId}`, payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        localEvents = localEvents.map((e) =>
          e.id === eventId ? { ...e, ...payload } : e
        );
        const updated = localEvents.find((e) => e.id === eventId)!;
        return { event: updated };
      }
      throw error;
    }
  },

  async deleteEvent(eventId: string): Promise<{ message: string; event: EventItem }> {
    try {
      const { data } = await apiClient.delete<{ message: string; event: EventItem }>(
        `/events/${eventId}`
      );
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        localEvents = localEvents.map((e) =>
          e.id === eventId ? { ...e, status: 'CANCELLED' } : e
        );
        const event = localEvents.find((e) => e.id === eventId)!;
        return { message: 'Event cancelled successfully', event };
      }
      throw error;
    }
  },
};
