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
  const setUser = useAuthStore((state) => state.setUser);

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

      // Set user with email
      setUser({
        id: sessionData.user_id,
        email: formData.email,
        created_at: new Date().toISOString(),
      });

      // Set access token as cookie
      document.cookie = `access_token=${sessionData.access_token}; path=/; secure; samesite=lax`;

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
        <div style={{ backgroundColor: '#F5F5F5' }} className="rounded-2xl shadow-lg p-8">
          {step === 'form' ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-hm-dark mb-6">
                  Create Account
                </h2>
              </div>

              <div>
                <label className="block text-sm font-semibold text-hm-dark mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-hm-dark mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    placeholder="25"
                    value={formData.age || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-hm-dark mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="70"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-hm-dark mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-hm-dark mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-4 bg-white border border-gray-300 rounded-lg min-w-fit">
                    <span className="font-medium text-hm-dark">+91</span>
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
                    className="flex-1 px-4 py-3 bg-white text-hm-dark placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-primary/10 border border-primary rounded-lg p-3">
                  <p className="text-sm text-primary font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#D84545';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#C41E3A';
                }}
                style={{ backgroundColor: loading ? '#d1d5db' : '#C41E3A' }}
                className="w-full disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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

              <p className="text-center text-sm text-hm-dark">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Log in
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-hm-dark mb-2">
                  Verify Email
                </h2>
                <p className="text-sm text-gray-700">
                  Enter the 6-digit code sent to {formData.email}
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
