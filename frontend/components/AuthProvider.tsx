'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { onAuthStateChange } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setSession = useAuthStore((state) => state.setSession);

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

  return <>{children}</>;
}
