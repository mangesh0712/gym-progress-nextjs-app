import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function sendOtp(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
  });
  if (error) throw error;
}

export async function verifyOtp(
  email: string,
  token: string
): Promise<{ access_token: string; refresh_token: string; user_id: string }> {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  if (!data.session) throw new Error('No session returned from OTP verification');
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user_id: data.user?.id || '',
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<{
  access_token: string;
  refresh_token: string;
  user_id: string;
} | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return null;
  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user_id: data.user?.id || '',
  };
}

export function onAuthStateChange(
  callback: (isAuthenticated: boolean, userId?: string) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(!!session, session?.user?.id);
  });
  return subscription;
}
