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
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: { access_token: string; refresh_token: string; user_id: string } | null) => void;
  setPhone: (phone: string | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
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
      isHydrated: false,
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
      setHydrated: (hydrated) =>
        set((state) => {
          state.isHydrated = hydrated;
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
          // Check if access_token cookie exists (client-side check)
          const cookieValue = document.cookie
            .split('; ')
            .find((row) => row.startsWith('access_token='))
            ?.split('=')[1];

          if (cookieValue) {
            // Cookie exists, try to load session from localStorage or Supabase
            const sessionData = await getSession();
            if (sessionData) {
              set((state) => {
                state.session = sessionData;
                state.isAuthenticated = true;
              });
            }
          } else {
            // No cookie, clear any persisted session
            set((state) => {
              state.session = null;
              state.isAuthenticated = false;
            });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // On error, clear auth state to be safe
          set((state) => {
            state.session = null;
            state.isAuthenticated = false;
          });
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
        user: state.user,
        session: state.session,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
          // Recompute isAuthenticated based on session after hydration
          state.isAuthenticated = state.session !== null;
        }
      },
    }
  )
);
