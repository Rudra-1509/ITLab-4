import { apiClient } from './client';
import { Ticket } from '../types';
import { INITIAL_EVENTS } from './mockData';

// Demo fallback tickets
let localTickets: Ticket[] = [
  {
    id: 'tkt-001-alpha',
    bookingId: 'book-sample-01',
    userId: 'usr-demo-audience-01',
    eventId: 'evt-001',
    seatId: 'seat-evt-001-A1',
    ticketCode: 'TICK-GSO99A1',
    qrCode: '',
    price: 1200,
    status: 'VALID',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    event: INITIAL_EVENTS[0],
    seat: {
      id: 'seat-evt-001-A1',
      eventId: 'evt-001',
      seatNumber: 'A1',
      row: 'A',
      section: 'MAIN',
      status: 'SOLD',
      price: 1200,
    },
    user: {
      id: 'usr-demo-audience-01',
      name: 'John Audience',
      email: 'user@example.com',
      role: 'AUDIENCE',
    },
  },
  {
    id: 'tkt-002-beta',
    bookingId: 'book-sample-01',
    userId: 'usr-demo-audience-01',
    eventId: 'evt-001',
    seatId: 'seat-evt-001-A2',
    ticketCode: 'TICK-GSO99A2',
    qrCode: '',
    price: 1200,
    status: 'VALID',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    event: INITIAL_EVENTS[0],
    seat: {
      id: 'seat-evt-001-A2',
      eventId: 'evt-001',
      seatNumber: 'A2',
      row: 'A',
      section: 'MAIN',
      status: 'SOLD',
      price: 1200,
    },
    user: {
      id: 'usr-demo-audience-01',
      name: 'John Audience',
      email: 'user@example.com',
      role: 'AUDIENCE',
    },
  },
];

export const ticketsApi = {
  async getMyTickets(): Promise<{ tickets: Ticket[] }> {
    try {
      const { data } = await apiClient.get<{ tickets: Ticket[] }>('/tickets/my');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Tickets] Backend offline, returning demo tickets');
        return { tickets: localTickets };
      }
      throw error;
    }
  },

  async getTicketById(ticketId: string): Promise<{ ticket: Ticket }> {
    try {
      const { data } = await apiClient.get<{ ticket: Ticket }>(`/tickets/${ticketId}`);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const found = localTickets.find((t) => t.id === ticketId) || localTickets[0];
        return { ticket: found };
      }
      throw error;
    }
  },

  // Helper for adding generated tickets during client simulation
  addMockTicket(ticket: Ticket) {
    localTickets.unshift(ticket);
  },
};
