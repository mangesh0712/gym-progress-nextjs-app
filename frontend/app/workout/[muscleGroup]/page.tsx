'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
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
  const [deleteConfirmingEntryId, setDeleteConfirmingEntryId] = useState<string | null>(null);

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

  const handleDeleteEntry = (entryId: string) => {
    setDeleteConfirmingEntryId(entryId);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmingEntryId) return;

    setLoggedExercises((prev) =>
      prev.filter((entry) => entry.id !== deleteConfirmingEntryId)
    );
    setDeleteConfirmingEntryId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmingEntryId(null);
  };

  const loggedExerciseNames = new Set(loggedExercises.map((entry) => entry.exerciseName));
  const availableExercises = exercises.filter((exercise) => !loggedExerciseNames.has(exercise.name));

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-hm-light">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="text-primary hover:text-hm-dark text-2xl font-bold cursor-pointer transition-colors"
              title="Go back to dashboard"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-primary">💪 Gym Tracker</h1>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content - 50/50 on mobile/tablet, 70/30 on desktop */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left side - 50% on mobile/tablet, 70% on desktop */}
          <div className="lg:col-span-3">
            <div className="bg-hm-light rounded-lg shadow-md p-4 sm:p-6 md:p-8">
              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-hm-dark mb-3 sm:mb-4 capitalize">
                {displayName}
              </h2>

              {/* Divider */}
              <div className="border-b border-gray-300 mb-6"></div>

              {/* Exercise Cards Grid - Scrollable Container */}
              <div className="min-h-[500px] max-h-[530px] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableExercises.map((exercise) => (
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
          </div>

          {/* Right side - 50% on mobile/tablet, 30% on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-hm-light rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-hm-dark mb-3 sm:mb-4">Logged</h3>

              {/* Logged Exercises List - Scrollable Container */}
              <div className="min-h-[500px] max-h-[530px] overflow-y-auto">
                <div className="space-y-2 sm:space-y-3">
                  {loggedExercises.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-600">
                      No exercises logged yet. Click an exercise to start!
                    </p>
                  ) : (
                    loggedExercises.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-1 sm:mb-2">
                          <p className="font-semibold text-hm-dark text-xs sm:text-sm truncate">
                            {entry.exerciseName}
                          </p>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => handleEditEntry(entry.id)}
                              className="text-primary hover:text-hm-dark text-xs font-bold cursor-pointer transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-700 space-y-0.5 sm:space-y-1">
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
      </div>

      {/* Modals */}
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

      {deleteConfirmingEntryId && (
        <ConfirmationModal
          title="Delete Exercise"
          message="Are you sure you want to delete this exercise? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmText="Delete"
          cancelText="Cancel"
        />
      )}
    </div>
  );
}
