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
  console.log('Sending OTP to:', email);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch(`${API_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('Send OTP response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Send OTP error:', error);
      throw new Error(error.detail || `Failed to send OTP (${response.status})`);
    }

    const data = await response.json();
    console.log('OTP sent successfully');
    return data.message;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      console.error('Send OTP error:', err.message);
      throw err;
    }
    throw new Error('Failed to send OTP');
  }
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

export function decodeJWT(token: string): { exp?: number; [key: string]: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token');
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch {
    return {};
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function saveWorkoutSession(
  muscleGroup: string,
  exercises: Array<{ exerciseName: string; sets: Array<{ kg: string; reps: string }> }>,
  accessToken: string
): Promise<{ id: string; message: string; exercises_count: number }> {
  if (!accessToken) throw new Error('No access token found');

  console.log('Saving workout with token:', accessToken.substring(0, 20) + '...');
  console.log('API URL:', `${API_URL}/workouts/sessions`);

  const response = await fetch(`${API_URL}/workouts/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      muscle_group: muscleGroup,
      exercises: exercises,
    }),
  });

  console.log('Response status:', response.status);
  console.log('Response url:', response.url);

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.detail || errorMessage;
    } catch {
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
