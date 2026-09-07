import { apiClient } from './client';
import { AuthResponse, User, UserSession, Role } from '../types';
import { DEMO_USERS, MOCK_SESSIONS } from './mockData';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// In-memory fallback session tracking for offline demo
let localSessions = [...MOCK_SESSIONS];

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Auth] Backend offline, using demo fallback for register');
        const mockUser: User = {
          id: `usr-${Date.now()}`,
          name: payload.name,
          email: payload.email,
          role: payload.role,
          createdAt: new Date().toISOString(),
        };
        const mockResponse: AuthResponse = {
          access_token: `mock-jwt-${Date.now()}`,
          token_type: 'bearer',
          user: mockUser,
        };
        return mockResponse;
      }
      throw error;
    }
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[API Auth] Backend offline, using demo fallback for login');
        const user = DEMO_USERS[payload.email] || {
          id: 'usr-custom-demo',
          name: payload.email.split('@')[0],
          email: payload.email,
          role: 'AUDIENCE',
        };
        return {
          access_token: `mock-jwt-token-${Date.now()}`,
          token_type: 'bearer',
          user,
        };
      }
      throw error;
    }
  },

  async getMe(): Promise<{ user: User }> {
    try {
      const { data } = await apiClient.get<{ user: User }>('/auth/me');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          return { user: JSON.parse(storedUser) };
        }
        return { user: DEMO_USERS['user@example.com'] };
      }
      throw error;
    }
  },

  async getSessions(): Promise<{ sessions: UserSession[] }> {
    try {
      const { data } = await apiClient.get<{ sessions: UserSession[] }>('/auth/sessions');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return { sessions: localSessions.filter((s) => !s.revoked) };
      }
      throw error;
    }
  },

  async revokeSession(sessionId: string): Promise<{ message: string }> {
    try {
      const { data } = await apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        localSessions = localSessions.map((s) =>
          s.id === sessionId ? { ...s, revoked: true } : s
        );
        return { message: 'Session revoked successfully' };
      }
      throw error;
    }
  },

  async logout(): Promise<{ message: string }> {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/logout');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return { message: 'Logged out successfully' };
      }
      throw error;
    }
  },

  async logoutAll(): Promise<{ message: string }> {
    try {
      const { data } = await apiClient.post<{ message: string }>('/auth/logout-all');
      return data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        localSessions = localSessions.map((s) => ({ ...s, revoked: true }));
        return { message: 'All sessions revoked successfully' };
      }
      throw error;
    }
  },
};
