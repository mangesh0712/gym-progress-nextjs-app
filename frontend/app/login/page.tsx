'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((state) => state.setSession);
  const setPhoneStore = useAuthStore((state) => state.setPhone);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullPhone = `+91${phone}`;
      await sendOtp(fullPhone);
      setPhoneStore(fullPhone);
      setStep('otp');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to send OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const fullPhone = `+91${phone}`;
      const sessionData = await verifyOtp(fullPhone, otp);
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
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h1 className="card-title text-2xl font-bold mb-6">Gym Tracker</h1>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Phone Number</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-base-200 rounded-lg border border-base-300">
                    <span className="font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="input input-bordered w-full"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Enter OTP sent to +91 {phone}
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="input input-bordered w-full text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="btn btn-ghost w-full"
              >
                Change Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
