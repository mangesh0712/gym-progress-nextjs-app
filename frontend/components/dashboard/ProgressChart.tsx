'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '@/lib/supabase';

interface ProgressChartProps {
  sessions: WorkoutSession[];
  selectedMuscleGroup: string;
}

const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function ProgressChart({ sessions, selectedMuscleGroup }: ProgressChartProps) {
  // Filter sessions by muscle group
  const filteredSessions = sessions.filter(s => s.muscle_group === selectedMuscleGroup);

  // Build data: for each session, track max kg per exercise
  const exerciseData: Record<string, Array<{ date: string; maxKg: number; totalReps: number }>> = {};

  filteredSessions.forEach(session => {
    const dateStr = new Date(session.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    session.workout_exercises?.forEach(exercise => {
      if (!exerciseData[exercise.exercise_name]) {
        exerciseData[exercise.exercise_name] = [];
      }

      const maxKg = Math.max(...exercise.sets.map(s => parseFloat(s.kg) || 0));
      const totalReps = exercise.sets.reduce((acc, s) => acc + (parseInt(s.reps) || 0), 0);

      exerciseData[exercise.exercise_name].push({
        date: dateStr,
        maxKg,
        totalReps,
      });
    });
  });

  // Sort sessions by date and merge to single data array
  const uniqueDates = new Set<string>();
  Object.values(exerciseData).forEach(data => {
    data.forEach(d => uniqueDates.add(d.date));
  });

  const chartData = Array.from(uniqueDates)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(date => {
      const point: Record<string, any> = { date };
      Object.entries(exerciseData).forEach(([exercise, data]) => {
        const entry = data.find(d => d.date === date);
        if (entry) {
          point[exercise] = entry.maxKg;
        }
      });
      return point;
    });

  if (Object.keys(exerciseData).length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-base-200 rounded-lg">
        <p className="text-sm text-gray-500">No workouts logged for {selectedMuscleGroup}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis label={{ value: 'Max Weight (kg)', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
          {Object.keys(exerciseData).map((exercise, idx) => (
            <Line
              key={exercise}
              type="monotone"
              dataKey={exercise}
              stroke={colors[idx % colors.length]}
              dot={{ r: 4 }}
              isAnimationActive={true}
              name={exercise}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
