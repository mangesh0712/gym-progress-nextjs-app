'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '@/lib/supabase';
import { formatMuscleGroupName, exercises as staticExercises } from '@/lib/exercises';

interface BodyPartCardProps {
  muscleGroup: string;
  sessions: WorkoutSession[];
}

export function BodyPartCard({ muscleGroup, sessions }: BodyPartCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Filter sessions for this muscle group
  const filteredSessions = sessions.filter(s => s.muscle_group === muscleGroup.toLowerCase());

  if (filteredSessions.length === 0) {
    return (
      <div className="bg-base-100 rounded-lg shadow-md p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowModal(true)}
      >
        <h4 className="text-lg font-bold text-hm-dark capitalize mb-3">{formatMuscleGroupName(muscleGroup)}</h4>
        <p className="text-xs text-gray-500 text-center py-6">No workouts yet</p>
      </div>
    );
  }

  // Get last 3 sessions for this muscle group
  const lastSessions = filteredSessions.slice(-3).sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Build chart data with max weight per session per exercise
  const chartData = lastSessions.map(session => {
    const data: Record<string, string | number> = {
      date: new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };

    if (session.workout_exercises) {
      session.workout_exercises.forEach(exercise => {
        const maxWeight = Math.max(...exercise.sets.map(s => parseFloat(s.kg) || 0));
        data[exercise.exercise_name] = maxWeight;
      });
    }

    return data;
  });

  // Get unique exercise names
  const exerciseNames = new Set<string>();
  lastSessions.forEach(session => {
    session.workout_exercises?.forEach(ex => exerciseNames.add(ex.exercise_name));
  });
  const uniqueExercises = Array.from(exerciseNames).slice(0, 2); // Show top 2 exercises

  // Get last session's top set
  const lastSession = filteredSessions[filteredSessions.length - 1];
  let lastSetInfo = 'N/A';
  if (lastSession.workout_exercises && lastSession.workout_exercises.length > 0) {
    const topExercise = lastSession.workout_exercises[0];
    const topSet = topExercise.sets[topExercise.sets.length - 1];
    if (topSet) {
      lastSetInfo = `${topExercise.exercise_name} ${topSet.kg}kg × ${topSet.reps}`;
    }
  }

  // Calculate trend (compare last session with previous)
  let trendIndicator = '→';
  let trendValue = '';
  if (filteredSessions.length >= 2) {
    const prevSession = filteredSessions[filteredSessions.length - 2];
    const lastEx = lastSession.workout_exercises?.[0];
    const prevEx = prevSession.workout_exercises?.find(e => e.exercise_name === lastEx?.exercise_name);

    if (lastEx && prevEx) {
      const lastWeight = parseFloat(lastEx.sets[0]?.kg || '0');
      const prevWeight = parseFloat(prevEx.sets[0]?.kg || '0');
      const lastReps = parseInt(lastEx.sets[0]?.reps || '0');
      const prevReps = parseInt(prevEx.sets[0]?.reps || '0');

      if (lastWeight > prevWeight) {
        trendIndicator = '↑';
        trendValue = `${(lastWeight - prevWeight).toFixed(1)}kg`;
      } else if (lastReps > prevReps) {
        trendIndicator = '↑';
        trendValue = `${lastReps - prevReps} rep`;
      } else if (lastWeight < prevWeight) {
        trendIndicator = '↓';
        trendValue = `${(prevWeight - lastWeight).toFixed(1)}kg`;
      }
    }
  }

  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  const muscleGroupData = staticExercises[muscleGroup.toLowerCase()] || [];

  return (
    <>
    <div
      className="bg-base-100 rounded-lg shadow-md p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => setShowModal(true)}
    >
      {/* Header */}
      <h4 className="text-lg font-bold text-hm-dark capitalize mb-3">{formatMuscleGroupName(muscleGroup)}</h4>

      {/* Mini Chart */}
      <div className="h-32 mb-3 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 10 }} width={30} />
            <Tooltip formatter={(value) => `${value}kg`} contentStyle={{ fontSize: '11px' }} />
            {uniqueExercises.map((exercise, idx) => (
              <Bar
                key={exercise}
                dataKey={exercise}
                fill={colors[idx % colors.length]}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="space-y-2 text-xs">
        <p className="text-gray-700 truncate">
          <span className="font-semibold">{lastSetInfo}</span>
        </p>
        {trendValue && (
          <p className="text-primary font-semibold flex items-center gap-1">
            <span>{trendIndicator} {trendValue}</span>
          </p>
        )}
      </div>
    </div>

    {/* Detail Modal */}
    {showModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold capitalize">{formatMuscleGroupName(muscleGroup)} Progress</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Full Chart */}
            <div>
              <h3 className="text-sm font-bold text-hm-dark mb-3">Last Sessions</h3>
              <div className="w-full h-64 bg-base-100 rounded-lg">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => `${value}kg`} />
                    {uniqueExercises.map((exercise, idx) => (
                      <Bar
                        key={exercise}
                        dataKey={exercise}
                        fill={colors[idx % colors.length]}
                        radius={[6, 6, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Last Set</p>
                <p className="text-sm font-semibold text-hm-dark">{lastSetInfo}</p>
              </div>

              {trendValue && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Progress vs Previous</p>
                  <p className="text-sm font-semibold text-primary flex items-center gap-1">
                    <span>{trendIndicator} {trendValue}</span>
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 mb-1">Total Sessions</p>
                <p className="text-sm font-semibold text-hm-dark">{filteredSessions.length} workouts</p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setShowModal(false);
                router.push(`/workout/${muscleGroup.toLowerCase()}`);
              }}
              className="w-full px-4 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus transition-colors"
            >
              Log Workout
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
