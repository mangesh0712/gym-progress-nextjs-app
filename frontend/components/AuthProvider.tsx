'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { onAuthStateChange } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setSession = useAuthStore((state) => state.setSession);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    initializeAuth();

    const subscription = onAuthStateChange((isAuthenticated, userId) => {
      if (isAuthenticated && userId) {
        setSession({
          access_token: '',
          refresh_token: '',
          user_id: userId,
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initializeAuth, setSession]);

  // Set cookie when session is available
  useEffect(() => {
    if (session?.access_token) {
      document.cookie = `access_token=${session.access_token}; path=/; secure; samesite=lax`;
    }
  }, [session?.access_token]);

  return <>{children}</>;
}
