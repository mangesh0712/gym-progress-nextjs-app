'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '@/lib/supabase';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      // Call logout API to blacklist the token
      if (session?.access_token) {
        await logoutApi(session.access_token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with client-side logout even if API fails
    } finally {
      // Clear client-side state regardless of API response
      logout();
      // Clear the access_token cookie
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💪 Gym Tracker</h1>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <button
              onClick={handleLogout}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back! 👋</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to track your progress today?
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Todays Workout</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Select a workout split to get started
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                Start Workout
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Your Splits</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your workout splits and routines
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all">
                View Splits
              </button>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Sessions</h2>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-gray-600 dark:text-gray-400">
                No sessions logged yet. Start your first workout to see them here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
