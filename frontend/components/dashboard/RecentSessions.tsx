'use client';

import { WorkoutSession } from '@/lib/supabase';

interface RecentSessionsProps {
  sessions: WorkoutSession[];
}

const muscleGroupColorMap: Record<string, string> = {
  chest: 'badge-error',
  legs: 'badge-info',
  shoulders: 'badge-secondary',
  back: 'badge-success',
  biceps: 'badge-warning',
  triceps: 'badge-primary',
  abs: 'badge-accent',
};

export function RecentSessions({ sessions }: RecentSessionsProps) {
  const recentSessions = sessions.slice(0, 5);

  if (recentSessions.length === 0) {
    return (
      <div className="w-full py-8 text-center bg-base-200 rounded-lg">
        <p className="text-sm text-gray-500">No workout sessions yet. Start logging your first workout!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentSessions.map(session => {
        const date = new Date(session.created_at).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        const totalSets = session.workout_exercises?.reduce(
          (acc, exercise) => acc + exercise.sets.length,
          0
        ) || 0;

        const badgeClass = muscleGroupColorMap[session.muscle_group] || 'badge-neutral';

        return (
          <div key={session.id} className="collapse collapse-arrow border border-base-300 bg-base-100">
            <input type="checkbox" />
            <div className="collapse-title flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className={`badge badge-lg ${badgeClass}`}>
                  {session.muscle_group}
                </span>
                <span className="text-sm text-gray-600">{date}</span>
              </div>
              <span className="text-xs text-gray-500">{totalSets} sets</span>
            </div>
            <div className="collapse-content">
              <div className="space-y-2">
                {session.workout_exercises?.map((exercise, idx) => (
                  <div key={idx} className="text-sm py-2 border-t border-gray-200 pt-2">
                    <p className="font-medium text-gray-800">{exercise.exercise_name}</p>
                    <p className="text-gray-600 mt-1">
                      {exercise.sets.map((set, setIdx) => (
                        <span key={setIdx}>
                          {setIdx > 0 && ' • '}
                          {set.reps}×{set.kg}kg
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
