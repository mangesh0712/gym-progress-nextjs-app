'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function OnboardingPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleCreateSplit = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body items-center text-center">
          <h1 className="card-title text-3xl font-bold mb-4">Welcome! 🏋️</h1>

          <p className="text-lg mb-6">
            Let's get you started by creating your first workout split.
          </p>

          <div className="bg-base-200 p-6 rounded-lg mb-6 w-full">
            <h2 className="font-semibold mb-2">What's a workout split?</h2>
            <p className="text-sm text-base-content/70">
              A split divides your training across different days, focusing on different muscle groups.
              For example: Chest, Back, Legs on different days.
            </p>
          </div>

          <button
            onClick={handleCreateSplit}
            className="btn btn-primary btn-lg w-full"
          >
            Create Your First Split
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-ghost w-full mt-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
