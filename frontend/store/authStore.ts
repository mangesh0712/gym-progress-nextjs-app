'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  session: { access_token: string } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: { access_token: string } | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    user: null,
    session: null,
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
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
    logout: () =>
      set((state) => {
        state.user = null;
        state.session = null;
        state.isAuthenticated = false;
      }),
  }))
);
