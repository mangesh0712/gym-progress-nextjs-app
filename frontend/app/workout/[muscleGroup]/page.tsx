'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { getExercisesForMuscleGroup, formatMuscleGroupName } from '@/lib/exercises';

interface LoggedEntry {
  id: string;
  exerciseName: string;
  sets: { kg: string; reps: string }[];
}

export default function WorkoutPage() {
  const router = useRouter();
  const params = useParams();
  const muscleGroup = params.muscleGroup as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [loggedExercises, setLoggedExercises] = useState<LoggedEntry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const exercises = getExercisesForMuscleGroup(muscleGroup);
  const displayName = formatMuscleGroupName(muscleGroup);

  const handleExerciseClick = (exerciseName: string) => {
    setSelectedExercise(exerciseName);
  };

  const handleSaveSets = (sets: { kg: string; reps: string }[]) => {
    if (!selectedExercise) return;

    if (editingEntryId) {
      // Update existing entry
      setLoggedExercises((prev) =>
        prev.map((entry) =>
          entry.id === editingEntryId
            ? { ...entry, sets }
            : entry
        )
      );
      setEditingEntryId(null);
    } else {
      // Create new entry
      setLoggedExercises((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          exerciseName: selectedExercise,
          sets,
        },
      ]);
    }
  };

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId);
    const entry = loggedExercises.find((e) => e.id === entryId);
    if (entry) {
      setSelectedExercise(entry.exerciseName);
    }
  };

  const handleGoBack = () => {
    if (loggedExercises.length > 0) {
      const confirmed = window.confirm(
        'You have unsaved exercises logged. Are you sure you want to go back? They will be lost.'
      );
      if (!confirmed) return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-2xl"
              title="Go back to dashboard"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💪 Gym Tracker</h1>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content - 50/50 on mobile/tablet, 70/30 on desktop */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
          {/* Left side - 50% on mobile/tablet, 70% on desktop */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 md:p-8 h-full">
              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 capitalize">
                {displayName}
              </h2>

              {/* Divider */}
              <div className="border-b border-gray-300 dark:border-gray-600 mb-6"></div>

              {/* Exercise Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    name={exercise.name}
                    color={exercise.color}
                    onClick={() => handleExerciseClick(exercise.name)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right side - 50% on mobile/tablet, 30% on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">Logged</h3>

              {/* Logged Exercises List */}
              <div className="space-y-2 sm:space-y-3 flex-1 overflow-y-auto">
                {loggedExercises.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    No exercises logged yet. Click an exercise to start!
                  </p>
                ) : (
                  loggedExercises.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-100 dark:bg-gray-700 p-2 sm:p-3 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-1 sm:mb-2">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                          {entry.exerciseName}
                        </p>
                        <button
                          onClick={() => handleEditEntry(entry.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium ml-2 shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 sm:space-y-1">
                        {entry.sets.map((set, setIndex) => (
                          <p key={setIndex} className="truncate">
                            Set {setIndex + 1}: {set.kg || '—'}kg {set.reps ? `x ${set.reps}` : ''}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedExercise && (
        <LogWorkoutModal
          exerciseName={selectedExercise}
          onSave={handleSaveSets}
          onClose={() => {
            setSelectedExercise(null);
            setEditingEntryId(null);
          }}
          initialSets={
            editingEntryId
              ? loggedExercises.find((e) => e.id === editingEntryId)?.sets
              : undefined
          }
        />
      )}
    </div>
  );
}
