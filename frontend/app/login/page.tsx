'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
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
      if (authMethod === 'phone') {
        const fullPhone = `+91${phone}`;
        await sendOtp(fullPhone);
        setPhone_store(fullPhone);
      } else {
        await sendOtp(email);
      }
      setStep('otp');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = authMethod === 'phone' ? `+91${phone}` : email;
      const sessionData = await verifyOtp(identifier, otp);
      setSession(sessionData);
      router.push('/onboarding');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to verify OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
          {/* Auth Method Tabs */}
          {step === 'input' && (
            <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setAuthMethod('phone');
                  setError('');
                }}
                className={`pb-3 font-medium text-sm transition-colors ${
                  authMethod === 'phone'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                📱 Phone OTP
              </button>
              <button
                onClick={() => {
                  setAuthMethod('email');
                  setError('');
                }}
                className={`pb-3 font-medium text-sm transition-colors ${
                  authMethod === 'email'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                📧 Email OTP
              </button>
            </div>
          )}

          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Log in to your account
                </h2>
              </div>

              {authMethod === 'phone' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-4 bg-gray-100 dark:bg-gray-700 rounded-lg min-w-fit">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        +91
                      </span>
                    </div>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading ||
                  (authMethod === 'phone' ? phone.length !== 10 : !email)
                }
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
                  {authMethod === 'phone'
                    ? `Enter the code sent to +91 ${phone}`
                    : `Enter the code sent to ${email}`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  One-Time Password
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest transition-all"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
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
                Change {authMethod === 'phone' ? 'Phone' : 'Email'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
