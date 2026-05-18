'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '@/lib/supabase';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const [showMuscleGroups, setShowMuscleGroups] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const muscleGroups = ['Legs', 'Shoulders', 'Chest', 'Back', 'Biceps', 'Triceps', 'Abs'];

  const handleMuscleGroupClick = (group: string) => {
    router.push(`/workout/${group.toLowerCase()}`);
  };

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
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

      {/* Main Content - 70/30 Layout */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left side - 70% (3 columns out of 4) */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 h-full min-h-96">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Progress</h2>
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="text-lg mb-2">📊 Graphs placeholder</p>
                  <p className="text-sm">Progress charts and statistics will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - 30% (1 column out of 4) */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col">
              <button
                onClick={() => setShowMuscleGroups(!showMuscleGroups)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-4 rounded-lg transition-all duration-200 mb-4"
              >
                Start Your Workout
              </button>

              {/* Muscle Group Buttons */}
              {showMuscleGroups && (
                <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
                  {muscleGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => handleMuscleGroupClick(group)}
                      className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
