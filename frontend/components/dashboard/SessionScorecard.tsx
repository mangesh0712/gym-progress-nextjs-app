'use client';

import { WorkoutSession } from '@/lib/supabase';
import { formatMuscleGroupName } from '@/lib/exercises';

interface SessionScorecardProps {
  muscleGroup: string;
  sessions: WorkoutSession[];
}

export function SessionScorecard({ muscleGroup, sessions }: SessionScorecardProps) {
  const filteredSessions = sessions.filter(s => s.muscle_group === muscleGroup.toLowerCase());

  if (filteredSessions.length === 0) {
    return (
      <div className="bg-base-100 rounded-lg border border-gray-200 p-4">
        <h3 className="font-bold capitalize text-sm text-gray-700 mb-2">{formatMuscleGroupName(muscleGroup)}</h3>
        <p className="text-xs text-gray-500">No workouts yet</p>
      </div>
    );
  }

  const lastSessions = filteredSessions.slice(-3).reverse();

  const primaryExercise = lastSessions[0]?.workout_exercises?.[0]?.exercise_name || 'N/A';

  let trendIndicator = '→';
  let trendValue = '';

  if (filteredSessions.length >= 2) {
    const lastSession = filteredSessions[filteredSessions.length - 1];
    const prevSession = filteredSessions[filteredSessions.length - 2];

    const lastEx = lastSession.workout_exercises?.find(e => e.exercise_name === primaryExercise);
    const prevEx = prevSession.workout_exercises?.find(e => e.exercise_name === primaryExercise);

    if (lastEx && prevEx) {
      const lastWeight = Math.max(...lastEx.sets.map(s => parseFloat(s.kg) || 0));
      const prevWeight = Math.max(...prevEx.sets.map(s => parseFloat(s.kg) || 0));
      const lastReps = Math.max(...lastEx.sets.map(s => parseInt(s.reps) || 0));
      const prevReps = Math.max(...prevEx.sets.map(s => parseInt(s.reps) || 0));

      if (lastWeight > prevWeight) {
        trendIndicator = '↑';
        trendValue = `+${(lastWeight - prevWeight).toFixed(1)}kg`;
      } else if (lastReps > prevReps) {
        trendIndicator = '↑';
        trendValue = `+${lastReps - prevReps} rep`;
      } else if (lastWeight < prevWeight) {
        trendIndicator = '↓';
        trendValue = `${(prevWeight - lastWeight).toFixed(1)}kg`;
      }
    }
  }

  return (
    <div className="bg-base-100 rounded-lg border border-gray-200 p-4">
      <h3 className="font-bold capitalize text-sm text-gray-700 mb-1">{formatMuscleGroupName(muscleGroup)}</h3>
      <p className="text-xs text-gray-500 mb-3">{primaryExercise}</p>

      <div className="space-y-2 mb-3">
        {lastSessions.map((session, idx) => {
          const date = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const exercise = session.workout_exercises?.find(e => e.exercise_name === primaryExercise);

          if (!exercise) return null;

          const maxWeight = Math.max(...exercise.sets.map(s => parseFloat(s.kg) || 0));
          const repsStr = exercise.sets.map(s => s.reps).join(', ');

          return (
            <div key={session.id} className="text-xs flex justify-between items-center border-t border-gray-100 pt-2">
              <div className="flex-1">
                <span className="text-gray-600">{date}</span>
                <span className="text-gray-500 mx-2">•</span>
                <span className="font-semibold text-gray-700">{maxWeight}kg</span>
                <span className="text-gray-500 mx-2">•</span>
                <span className="text-gray-600">{repsStr}</span>
              </div>
            </div>
          );
        })}
      </div>

      {trendValue && (
        <div className="text-xs font-semibold text-primary">
          {trendIndicator} {trendValue} this week
        </div>
      )}
    </div>
  );
}
