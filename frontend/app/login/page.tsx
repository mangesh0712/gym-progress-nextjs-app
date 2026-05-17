'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((state) => state.setSession);
  const setPhone_store = useAuthStore((state) => state.setPhone);

  const handleSendOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullPhone = `+91${phone}`;
      await sendOtp(fullPhone);
      setPhone_store(fullPhone);
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
      const fullPhone = `+91${phone}`;
      const sessionData = await verifyOtp(fullPhone, otp);
      setSession(sessionData);
      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            💪 Gym Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your progress, achieve your goals
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Log in to your account
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-gray-200 dark:bg-gray-700 rounded-lg min-w-fit">
                    <span className="font-medium text-gray-900 dark:text-white">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verify OTP
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code sent to +91 {phone}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest transition-all"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
                className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 transition-colors"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
