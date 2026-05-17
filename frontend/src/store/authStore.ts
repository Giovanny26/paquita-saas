import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  credits: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { user, token } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      register: async (email, password, name) => {
        const res = await api.post('/auth/register', { email, password, name });
        const { user, token } = res.data;
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const res = await api.get('/auth/me');
        set({ user: res.data.user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);