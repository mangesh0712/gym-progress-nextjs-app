'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const session = useAuthStore((state) => state.session);
  const logout = useAuthStore((state) => state.logout);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-md">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Gym Tracker</a>
        </div>
        <div className="flex-none">
          <button onClick={handleLogout} className="btn btn-ghost">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h1 className="card-title text-2xl">Welcome back! 👋</h1>
              <p className="text-base-content/70">
                Ready to track your progress today?
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-lg">Today's Workout</h2>
                <p className="text-base-content/70">
                  Select a workout split to get started
                </p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">Start Workout</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <h2 className="card-title text-lg">Your Splits</h2>
                <p className="text-base-content/70">
                  Manage your workout splits and routines
                </p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-primary btn-sm">View Splits</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recent Sessions</h2>
              <div className="divider my-2"></div>
              <p className="text-base-content/70">
                No sessions logged yet. Start your first workout to see them here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
