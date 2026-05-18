'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup, verifySignup, SignupData } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState<SignupData>({
    name: '',
    age: 0,
    weight: 0,
    email: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');

  const setSession = useAuthStore((state) => state.setSession);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.age || !formData.weight || !formData.email || !formData.phone) {
        throw new Error('Please fill all fields');
      }

      if (formData.age < 13 || formData.age > 120) {
        throw new Error('Age must be between 13 and 120');
      }

      if (formData.weight <= 0) {
        throw new Error('Weight must be greater than 0');
      }

      const responseMessage = await signup(formData);
      setMessage(responseMessage);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (otp.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      const sessionData = await verifySignup(formData, otp);
      setSession(sessionData);

      // Set access token as cookie
      document.cookie = `access_token=${sessionData.access_token}; path=/; secure; samesite=lax`;

      setTimeout(() => {
        router.push('/onboarding');
      }, 100);
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
          {step === 'form' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                  Create Account
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    placeholder="25"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="70"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-gray-200 dark:bg-gray-700 rounded-lg min-w-fit">
                    <span className="font-medium text-gray-900 dark:text-white">+91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData((prev) => ({
                        ...prev,
                        phone: filtered,
                      }));
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verify Email
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the 6-digit code sent to {formData.email}
                </p>
              </div>

              {message && (
                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-400">{message}</p>
                </div>
              )}

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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify & Create Account'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtp('');
                  setError('');
                  setMessage('');
                }}
                className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 transition-colors"
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
