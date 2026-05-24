'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '@/lib/supabase';

interface ProgressChartProps {
  sessions: WorkoutSession[];
  selectedMuscleGroup: string;
}

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function ProgressChart({ sessions, selectedMuscleGroup }: ProgressChartProps) {
  // Filter sessions by muscle group
  const filteredSessions = sessions.filter(s => s.muscle_group === selectedMuscleGroup);

  if (filteredSessions.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-base-200 rounded-lg">
        <p className="text-sm text-gray-500">No workouts logged for {selectedMuscleGroup}</p>
      </div>
    );
  }

  // Build data structure: map of exercise names to arrays of session data
  const exerciseMap: Record<string, Array<{ date: string; weight: number; reps: number; dateObj: Date }>> = {};

  filteredSessions.forEach(session => {
    const dateObj = new Date(session.created_at);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    session.workout_exercises?.forEach(exercise => {
      const exerciseName = exercise.exercise_name;
      if (!exerciseMap[exerciseName]) {
        exerciseMap[exerciseName] = [];
      }

      // For each set, track weight and reps
      exercise.sets.forEach(set => {
        const weight = parseFloat(set.kg) || 0;
        const reps = parseInt(set.reps) || 0;

        // Add entry for each set (not just aggregated)
        exerciseMap[exerciseName].push({
          date: dateStr,
          weight,
          reps,
          dateObj,
        });
      });
    });
  });

  // Create chart data: one data point per unique date per exercise
  // Group by date, then aggregate data for each exercise on that date
  const dateMap: Record<string, Record<string, { weight: number; reps: number }>> = {};

  Object.entries(exerciseMap).forEach(([exercise, data]) => {
    data.forEach(entry => {
      if (!dateMap[entry.date]) {
        dateMap[entry.date] = {};
      }
      if (!dateMap[entry.date][exercise]) {
        dateMap[entry.date][exercise] = { weight: 0, reps: 0 };
      }
      // Keep max weight and sum reps for the date
      dateMap[entry.date][exercise].weight = Math.max(dateMap[entry.date][exercise].weight, entry.weight);
      dateMap[entry.date][exercise].reps += entry.reps;
    });
  });

  // Convert to array and sort by date
  const chartData = Object.entries(dateMap)
    .map(([date, exercises]) => ({
      date,
      ...exercises,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get unique exercise names
  const exerciseNames = Object.keys(exerciseMap);

  return (
    <div className="w-full space-y-4">
      <div className="text-sm text-gray-600">
        <p>📊 Weight (bars) & Reps (lines) progression for {selectedMuscleGroup}</p>
      </div>

      <div className="w-full h-96 bg-base-100 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 80, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
            <YAxis
              yAxisId="left"
              label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Reps', angle: 90, position: 'insideRight' }}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--color-base-200))',
                border: '1px solid rgb(var(--color-base-300))',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                zIndex: 50,
              }}
              content={({ active, payload }) => {
                if (!active || !payload) return null;
                return (
                  <div className="bg-base-200 p-2 rounded border border-base-300 text-xs shadow-lg">
                    {payload.map((entry: any, idx: number) => {
                      const exerciseName = entry.name.replace(/_weight|_reps/, '');
                      const isWeight = entry.name.includes('_weight');
                      return (
                        <div key={idx} style={{ color: entry.color }}>
                          {exerciseName}: {entry.value} {isWeight ? 'kg' : 'reps'}
                        </div>
                      );
                    })}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />

            {/* Render bars for weight and lines for reps */}
            {exerciseNames.map((exercise, idx) => (
              <Bar
                key={`${exercise}-weight`}
                yAxisId="left"
                dataKey={`${exercise}.weight`}
                name={`${exercise} (kg)`}
                fill={colors[idx % colors.length]}
                opacity={0.7}
              />
            ))}

            {exerciseNames.map((exercise, idx) => (
              <Line
                key={`${exercise}-reps`}
                yAxisId="right"
                type="monotone"
                dataKey={`${exercise}.reps`}
                name={`${exercise} (reps)`}
                stroke={colors[idx % colors.length]}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                isAnimationActive={true}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Exercise Summary Table */}
      <div className="space-y-2">
        <h4 className="text-sm font-bold">Exercise Breakdown</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {exerciseNames.map((exercise, idx) => {
            const data = exerciseMap[exercise];
            const latestEntry = data[data.length - 1];
            const oldestEntry = data[0];
            const maxWeight = Math.max(...data.map(d => d.weight));
            const totalReps = data.reduce((sum, d) => sum + d.reps, 0);

            return (
              <div key={exercise} className="bg-base-200 p-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">{exercise}</p>
                <div className="space-y-1 text-xs">
                  <p>Max Weight: <span className="font-bold text-primary">{maxWeight}kg</span></p>
                  <p>Total Reps: <span className="font-bold text-success">{totalReps}</span></p>
                  <p>Latest: {latestEntry.weight}kg × {latestEntry.reps} reps</p>
                  {data.length > 1 && (
                    <p className="text-gray-600">Sessions: {data.length} sets logged</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
