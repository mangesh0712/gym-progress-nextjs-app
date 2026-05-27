'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutSession } from '@/lib/supabase';

interface FrequencyChartProps {
  sessions: WorkoutSession[];
}

const muscleGroupColors: Record<string, string> = {
  chest: '#f87171',
  legs: '#60a5fa',
  shoulders: '#c084fc',
  back: '#34d399',
  biceps: '#fbbf24',
  triceps: '#818cf8',
  abs: '#14b8a6',
};

export function FrequencyChart({ sessions }: FrequencyChartProps) {
  // Filter to last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSessions = sessions.filter(session => {
    const sessionDate = new Date(session.created_at);
    return sessionDate >= thirtyDaysAgo;
  });

  // Count by muscle group
  const frequencyMap: Record<string, number> = {};
  recentSessions.forEach(session => {
    const group = session.muscle_group;
    frequencyMap[group] = (frequencyMap[group] || 0) + 1;
  });

  const data = Object.entries(frequencyMap).map(([muscle, count]) => ({
    muscle,
    count,
  }));

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-base-200 rounded-lg">
        <p className="text-sm text-gray-500">No workouts in the last 30 days</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="muscle" type="category" width={90} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="#3b82f6"
            radius={[0, 8, 8, 0]}
            name="Sessions"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
