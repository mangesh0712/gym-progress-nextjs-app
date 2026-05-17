'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

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
    <>
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Welcome! 🏋️</h1>

            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
              Let's get you started by creating your first workout split.
            </p>

            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg mb-6 w-full">
              <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">What's a workout split?</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A split divides your training across different days, focusing on different muscle groups.
                For example: Chest, Back, Legs on different days.
              </p>
            </div>

            <button
              onClick={handleCreateSplit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 mb-3"
            >
              Create Your First Split
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
