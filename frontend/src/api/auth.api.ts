import type { User } from '../types';
import client from './client';

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const res = await client.post('/auth/register', { email, password, name });
    return res.data;
  },

  me: async (): Promise<{ user: User }> => {
    const res = await client.get('/auth/me');
    return res.data;
  },
};
