import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SignupData {
  name: string;
  age: number;
  weight: number;
  email: string;
  phone: string;
}

export async function signup(data: SignupData): Promise<string> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sign up');
  }

  const result = await response.json();
  return result.message;
}

export async function verifySignup(
  data: SignupData,
  code: string
): Promise<{ access_token: string; refresh_token: string; user_id: string }> {
  const response = await fetch(`${API_URL}/auth/verify-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, otp_code: code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to verify OTP');
  }

  const result = await response.json();
  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    user_id: result.user_id,
  };
}

export async function sendOtp(email: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send OTP');
  }

  const data = await response.json();
  return data.message;
}

export async function verifyOtp(
  email: string,
  code: string
): Promise<{ access_token: string; refresh_token: string; user_id: string }> {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to verify OTP');
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user_id: data.user_id,
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

export async function logoutApi(accessToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to logout');
  }
}
