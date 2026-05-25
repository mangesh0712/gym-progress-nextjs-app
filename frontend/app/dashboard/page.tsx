'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchWorkoutHistory, logoutApi, WorkoutSession } from '@/lib/supabase';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ConfirmationModal } from '@/components/ConfirmationModal';
// import { ConsistencyChart } from '@/components/dashboard/ConsistencyChart';
import { SessionScorecard } from '@/components/dashboard/SessionScorecard';
import { BodyPartCard } from '@/components/dashboard/BodyPartCard';

const muscleGroupsList = ['Chest', 'Legs', 'Shoulders', 'Back', 'Biceps', 'Triceps', 'Abs'];

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  const [showMuscleGroups, setShowMuscleGroups] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        if (session?.access_token) {
          const data = await fetchWorkoutHistory(session.access_token);
          setSessions(data);
        }
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.access_token) {
      loadSessions();
    }
  }, [session?.access_token]);

  const handleMuscleGroupClick = (group: string) => {
    const path = `/workout/${group.toLowerCase()}`;
    console.log('Navigating to:', path);
    router.push(path);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = async () => {
    try {
      if (session?.access_token) {
        await logoutApi(session.access_token);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      logout();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym-auth');
      }

      document.cookie = 'access_token=; path=/; max-age=0;';
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

      setShowLogoutConfirm(false);

      setTimeout(() => {
        router.push('/login');
      }, 100);
    }
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">💪 Gym Tracker</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/exercises')}
              className="link link-primary text-sm md:text-base"
            >
              Manage Exercises
            </button>
            <ThemeSwitcher />
            <button
              onClick={handleLogout}
              className="text-primary hover:text-primary-focus font-semibold transition-colors text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile First Single Column */}
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Start Workout Card */}
          <div className="card bg-base-200 shadow-md p-6">
            <button
              onClick={() => setShowMuscleGroups(!showMuscleGroups)}
              className="w-full px-4 py-2 bg-black text-white rounded-sm font-semibold hover:bg-gray-900 transition-colors"
            >
              Start Your Workout
            </button>

            {showMuscleGroups && (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
                {muscleGroupsList.map((group) => (
                  <button
                    key={group}
                    onClick={() => handleMuscleGroupClick(group)}
                    type="button"
                    className="px-3 py-2 bg-gray-300 text-black rounded-sm text-sm hover:bg-gray-400 transition-colors cursor-pointer pointer-events-auto"
                  >
                    {group}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Consistency Chart - Commented Out */}
          {/* {isLoading ? (
            <div className="card bg-base-200 shadow-md p-6 h-96 flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-md p-4 md:p-6">
              <ConsistencyChart sessions={sessions} />
            </div>
          )} */}

          {/* Session Scorecard */}
          {isLoading ? (
            <div className="card bg-base-200 shadow-md p-6 h-32 flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-hm-dark">Recent Sessions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {muscleGroupsList.map((group) => (
                  <SessionScorecard
                    key={group}
                    muscleGroup={group.toLowerCase()}
                    sessions={sessions}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Body Part Progress Grid */}
          <div>
            <h3 className="text-xl font-bold text-hm-dark mb-4">Progress by Body Part</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {muscleGroupsList.map((group) => (
                <BodyPartCard
                  key={group}
                  muscleGroup={group.toLowerCase()}
                  sessions={sessions}
                />
              ))}
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
