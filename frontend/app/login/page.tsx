'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const setSession = useAuthStore((state) => state.setSession);

  const handleSendOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const responseMessage = await sendOtp(email);
      setMessage(responseMessage);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sessionData = await verifyOtp(email, otp);
      setSession(sessionData);

      // Set access token as cookie for middleware
      document.cookie = `access_token=${sessionData.access_token}; path=/; secure; samesite=lax`;

      // Small delay to ensure cookie is set before redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-primary mb-2">
            💪 Gym Tracker
          </h1>
          <p className="text-hm-dark mt-2 font-medium">
            Track your progress, achieve your goals
          </p>
        </div>

        {/* Card */}
        <div className="bg-hm-light rounded-2xl shadow-lg p-8">
          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-hm-dark mb-6">
                  Log in to your account
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-hm-dark mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              {error && (
                <div className="bg-primary/10 border border-primary rounded-lg p-3">
                  <p className="text-sm text-primary font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                onMouseEnter={(e) => {
                  if (!loading && email) e.currentTarget.style.backgroundColor = '#D84545';
                }}
                onMouseLeave={(e) => {
                  if (!loading && email) e.currentTarget.style.backgroundColor = '#C41E3A';
                }}
                style={{ backgroundColor: loading || !email ? '#d1d5db' : '#C41E3A' }}
                className="w-full disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>

              <p className="text-center text-sm text-hm-dark">
                Don't have an account?{' '}
                <a href="/signup" className="text-primary hover:underline font-semibold">
                  Sign up
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-hm-dark mb-2">
                  Verify OTP
                </h2>
                <p className="text-sm text-gray-700">
                  Enter the 6-digit code sent to {email}
                </p>
              </div>

              {message && (
                <div className="bg-green-100/50 border border-green-300 rounded-lg p-3">
                  <p className="text-sm text-green-700 font-medium">{message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-hm-dark mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="w-full px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg tracking-widest transition-all"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="bg-primary/10 border border-primary rounded-lg p-3">
                  <p className="text-sm text-primary font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                onMouseEnter={(e) => {
                  if (!loading && otp.length === 6) e.currentTarget.style.backgroundColor = '#D84545';
                }}
                onMouseLeave={(e) => {
                  if (!loading && otp.length === 6) e.currentTarget.style.backgroundColor = '#C41E3A';
                }}
                style={{ backgroundColor: loading || otp.length !== 6 ? '#d1d5db' : '#C41E3A' }}
                className="w-full disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('input');
                  setOtp('');
                  setError('');
                }}
                className="w-full text-center text-primary hover:text-hm-dark font-medium py-2 transition-colors cursor-pointer"
              >
                Change Email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
