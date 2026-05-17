'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { getSession } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  session: { access_token: string; refresh_token: string; user_id: string } | null;
  phone: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: { access_token: string; refresh_token: string; user_id: string } | null) => void;
  setPhone: (phone: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      user: null,
      session: null,
      phone: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = user !== null;
        }),
      setSession: (session) =>
        set((state) => {
          state.session = session;
          state.isAuthenticated = session !== null;
        }),
      setPhone: (phone) =>
        set((state) => {
          state.phone = phone;
        }),
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
      logout: () =>
        set((state) => {
          state.user = null;
          state.session = null;
          state.phone = null;
          state.isAuthenticated = false;
        }),
      initializeAuth: async () => {
        set((state) => {
          state.isLoading = true;
        });
        try {
          const sessionData = await getSession();
          if (sessionData) {
            set((state) => {
              state.session = sessionData;
              state.isAuthenticated = true;
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
        } finally {
          set((state) => {
            state.isLoading = false;
          });
        }
      },
    })),
    {
      name: 'gym-auth',
      partialize: (state) => ({
        session: state.session,
        phone: state.phone,
      }),
    }
  )
);
