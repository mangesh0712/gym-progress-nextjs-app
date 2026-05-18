'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '@/lib/supabase';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ConfirmationModal } from '@/components/ConfirmationModal';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);
  const [showMuscleGroups, setShowMuscleGroups] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const muscleGroups = ['Legs', 'Shoulders', 'Chest', 'Back', 'Biceps', 'Triceps', 'Abs'];

  const handleMuscleGroupClick = (group: string) => {
    router.push(`/workout/${group.toLowerCase()}`);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      // Call logout API to blacklist the token
      if (session?.access_token) {
        await logoutApi(session.access_token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with client-side logout even if API fails
    } finally {
      // Clear client-side state FIRST
      logout();

      // Clear localStorage completely
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym-auth');
      }

      // Clear the access_token cookie
      document.cookie = 'access_token=; path=/; max-age=0;';
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      setShowLogoutConfirm(false);

      // Redirect after a small delay to ensure cookies/localStorage are cleared
      setTimeout(() => {
        router.push('/login');
      }, 100);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-hm-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">💪 Gym Tracker</h1>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <button
              onClick={handleLogout}
              className="text-primary hover:text-hm-dark dark:hover:text-gray-300 font-semibold transition-colors"
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
            <div className="bg-hm-light rounded-lg shadow-md p-8 h-full min-h-96">
              <h2 className="text-2xl font-bold text-hm-dark mb-6">Your Progress</h2>
              <div className="flex items-center justify-center h-full text-gray-600">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">📊 Graphs placeholder</p>
                  <p className="text-sm">Progress charts and statistics will appear here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - 30% (1 column out of 4) */}
          <div className="lg:col-span-1">
            <div className="bg-hm-light rounded-lg shadow-md p-6 h-full flex flex-col">
              <button
                onClick={() => setShowMuscleGroups(!showMuscleGroups)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D84545')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C41E3A')}
                style={{ backgroundColor: '#C41E3A' }}
                className="w-full text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 mb-4 cursor-pointer"
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
                      className="w-full bg-white hover:bg-gray-100 text-hm-dark font-semibold py-3 px-4 rounded-lg transition-all duration-200 border border-gray-300 cursor-pointer"
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <ConfirmationModal
          title="Logout"
          message="Are you sure you want to logout? You will need to login again to access your workouts."
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
          confirmText="Logout"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
