'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { onAuthStateChange } from '@/lib/supabase';

const COOKIE_OPTIONS = 'path=/; secure; samesite=lax';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    initializeAuth().catch((error) => {
      console.error('Failed to initialize auth:', error);
    });
  }, [initializeAuth]);

  useEffect(() => {
    const subscription = onAuthStateChange((isAuthenticated, userId) => {
      if (isAuthenticated && userId) {
        setSession({
          user_id: userId,
          access_token: '',
          refresh_token: '',
        });
      }
    });

    return () => subscription?.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session?.access_token?.trim()) {
      document.cookie = `access_token=${session.access_token}; ${COOKIE_OPTIONS}`;
    }
  }, [session?.access_token]);

  return <>{children}</>;
}
