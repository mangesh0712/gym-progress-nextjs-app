'use client';

import { WorkoutSession } from '@/lib/supabase';
import { muscleGroupColors } from '@/lib/muscleGroupColors';

interface ConsistencyChartProps {
  sessions: WorkoutSession[];
}

export function ConsistencyChart({ sessions }: ConsistencyChartProps) {

  // Get last 10 weeks of data
  const getCalendarData = () => {
    const workoutDates: Record<string, string[]> = {}; // date -> [muscleGroups]
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 70); // 10 weeks

    // Group all sessions by date
    sessions.forEach((session) => {
      const sessionDate = new Date(session.created_at);
      const dateStr = sessionDate.toISOString().split('T')[0];
      if (!workoutDates[dateStr]) {
        workoutDates[dateStr] = [];
      }
      workoutDates[dateStr].push(session.muscle_group);
    });

    return workoutDates;
  };

  const workoutDates = getCalendarData();

  // Group dates by week for calendar layout
  const weeks: { dates: Array<{ date: string; muscleGroups: string[]; dayOfWeek: number }> }[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 70);

  let currentWeek: { dates: Array<{ date: string; muscleGroups: string[]; dayOfWeek: number }> } | null = null;

  for (let i = 0; i < 70; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek) {
      weeks.push(currentWeek);
      currentWeek = null;
    }

    if (!currentWeek) {
      currentWeek = { dates: [] };
    }

    currentWeek.dates.push({
      date: dateStr,
      muscleGroups: workoutDates[dateStr] || [],
      dayOfWeek,
    });
  }

  if (currentWeek) {
    weeks.push(currentWeek);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderDayCell = (dateData: { date: string; muscleGroups: string[]; dayOfWeek: number }) => {
    if (dateData.muscleGroups.length === 0) {
      return (
        <div
          className="w-6 sm:w-8 h-6 sm:h-8 rounded-sm border border-gray-200 flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary cursor-pointer"
          style={{ backgroundColor: '#e5e7eb', opacity: 0.5 }}
          title=""
        />
      );
    }

    if (dateData.muscleGroups.length === 1) {
      // Single workout - square
      const color = muscleGroupColors[dateData.muscleGroups[0]];
      return (
        <div
          className="w-6 sm:w-8 h-6 sm:h-8 rounded-sm border border-gray-200 flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary cursor-pointer"
          style={{ backgroundColor: color, opacity: 1 }}
          title={`${dateData.date}: ${dateData.muscleGroups[0]}`}
        />
      );
    }

    // Multiple workouts - circle with pie chart
    const groupedColors: Record<string, number> = {};

    dateData.muscleGroups.forEach(mg => {
      groupedColors[mg] = (groupedColors[mg] || 0) + 1;
    });

    const uniqueColors = Object.entries(groupedColors).map(([mg, count]) => ({
      mg,
      count,
      color: muscleGroupColors[mg],
    }));

    const total = Object.values(groupedColors).reduce((a, b) => a + b, 0);
    let cumulativePercent = 0;
    const gradientStops = uniqueColors.map(({ color, count }) => {
      const percent = (count / total) * 100;
      const start = cumulativePercent;
      const end = cumulativePercent + percent;
      cumulativePercent = end;
      return `${color} ${start}% ${end}%`;
    });

    const gradientValue = `conic-gradient(${gradientStops.join(', ')})`;

    return (
      <div
        className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 hover:ring-primary cursor-pointer"
        style={{ background: gradientValue, opacity: 1 }}
        title={`${dateData.date}: ${dateData.muscleGroups.join(', ')}`}
      />
    );
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h3 className="text-lg font-bold text-hm-dark mb-1">Consistency</h3>
        <p className="text-xs text-gray-600">Your workout activity by body part (last 10 weeks)</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-0.5 sm:gap-1 min-w-min">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 sm:gap-1 pr-1 sm:pr-2">
            {dayLabels.map((day) => (
              <div
                key={day}
                className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-xs font-medium text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex gap-0.5 sm:gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5 sm:gap-1">
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const dateData = week.dates.find(d => d.dayOfWeek === dayIdx);
                  if (!dateData) return null;

                  return (
                    <div key={`${weekIdx}-${dayIdx}`}>
                      {renderDayCell(dateData)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-700">Body Parts</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(muscleGroupColors).map(([muscleGroup, color]) => (
            <div key={muscleGroup} className="flex items-center gap-2">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600 capitalize">{muscleGroup}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
