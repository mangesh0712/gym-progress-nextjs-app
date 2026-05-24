'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { formatMuscleGroupName, exercises as staticExercises } from '@/lib/exercises';
import { saveWorkoutSession, isTokenExpired, refreshAccessToken, fetchExercises, fetchWorkoutHistory, addExercise, Exercise, WorkoutSession } from '@/lib/supabase';

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
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.email === 'mangeshkhandale327@gmail.com';

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [loggedExercises, setLoggedExercises] = useState<LoggedEntry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deleteConfirmingEntryId, setDeleteConfirmingEntryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [apiExercises, setApiExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [showPreviousWorkouts, setShowPreviousWorkouts] = useState(false);
  const [previousWorkouts, setPreviousWorkouts] = useState<WorkoutSession[]>([]);
  const [isLoadingPrevious, setIsLoadingPrevious] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [addExerciseError, setAddExerciseError] = useState('');

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        if (session?.access_token) {
          setIsLoadingExercises(true);
          const data = await fetchExercises(muscleGroup, session.access_token);
          setApiExercises(data);
        }
      } catch (error) {
        console.error('Failed to load exercises from API:', error);
        setApiExercises([]);
      } finally {
        setIsLoadingExercises(false);
      }
    };

    if (session?.access_token) {
      loadExercises();
    }
  }, [muscleGroup, session?.access_token]);

  const getExercisesForDisplay = () => {
    if (apiExercises.length > 0) {
      return apiExercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        color: getColorForExercise(ex.name),
      }));
    }
    return staticExercises[muscleGroup.toLowerCase()] || [];
  };

  const getColorForExercise = (exerciseName: string): string => {
    const muscleGroupData = staticExercises[muscleGroup.toLowerCase()];
    const staticExercise = muscleGroupData?.find(e => e.name === exerciseName);
    return staticExercise?.color || 'from-gray-400 to-gray-600';
  };

  const exercises = getExercisesForDisplay();
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

  const handleSaveWorkout = async () => {
    if (loggedExercises.length === 0) {
      setSaveError('No exercises logged');
      return;
    }

    // Get token and refresh token from session or localStorage
    let token = session?.access_token;
    let refreshToken = session?.refresh_token;

    if (!token && typeof window !== 'undefined') {
      // Try to get from localStorage persisted auth
      const storedAuth = localStorage.getItem('gym-auth');
      if (storedAuth) {
        try {
          const parsed = JSON.parse(storedAuth);
          token = parsed.state?.session?.access_token;
          refreshToken = parsed.state?.session?.refresh_token;
        } catch {
          // Silent fail, token will be null
        }
      }
    }

    if (!token) {
      setSaveError('Session expired. Please login again.');
      // Clear session and redirect
      const logout = useAuthStore.getState().logout;
      logout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gym-auth');
        document.cookie = 'access_token=; path=/; max-age=0;';
      }
      setTimeout(() => {
        router.push('/login');
      }, 500);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      // Check if token is expired and refresh if needed
      if (isTokenExpired(token)) {
        if (!refreshToken) {
          throw new Error('Cannot refresh token. Please login again.');
        }
        token = await refreshAccessToken(refreshToken);
      }

      const result = await saveWorkoutSession(muscleGroup, loggedExercises, token);
      setSaveMessage(`✓ Saved ${result.exercises_count} exercises!`);

      // Clear local state after successful save
      setTimeout(() => {
        setLoggedExercises([]);
        setSaveMessage('');
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workout';

      // Only logout on actual 401 errors, not on other errors that mention "token"
      if (errorMessage.includes('HTTP 401')) {
        setSaveError('Session expired. Please login again.');
        const logout = useAuthStore.getState().logout;
        logout();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('gym-auth');
          document.cookie = 'access_token=; path=/; max-age=0;';
        }
        setTimeout(() => {
          router.push('/login');
        }, 500);
      } else {
        setSaveError(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loggedExerciseNames = new Set(loggedExercises.map((entry) => entry.exerciseName));
  const availableExercises = exercises.filter((exercise) => !loggedExerciseNames.has(exercise.name));

  const getCompleteSetsCount = (exercise: LoggedEntry) => {
    return exercise.sets.filter((set) => set.kg && set.reps).length;
  };

  const isSaveWorkoutEnabled = loggedExercises.length >= 2 &&
    loggedExercises.every((exercise) => getCompleteSetsCount(exercise) >= 2);

  const getSaveWorkoutDisabledReason = () => {
    if (loggedExercises.length === 0) return 'No exercises logged';
    if (loggedExercises.length < 2) return `Need at least 2 exercises (${loggedExercises.length} logged)`;
    const exercisesWithIncompleteSets = loggedExercises.filter(
      (ex) => getCompleteSetsCount(ex) < 2
    );
    if (exercisesWithIncompleteSets.length > 0) {
      return `${exercisesWithIncompleteSets.length} exercise(s) need at least 2 complete sets (kg + reps)`;
    }
    return '';
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

  const loadPreviousWorkouts = async () => {
    try {
      setIsLoadingPrevious(true);
      if (session?.access_token) {
        const data = await fetchWorkoutHistory(session.access_token);
        const filtered = data.filter(w => w.muscle_group === muscleGroup.toLowerCase());
        setPreviousWorkouts(filtered);
        setShowPreviousWorkouts(true);
      }
    } catch (error) {
      console.error('Failed to load previous workouts:', error);
    } finally {
      setIsLoadingPrevious(false);
    }
  };

  const handleAddExercise = async () => {
    setAddExerciseError('');

    // Validate exercise name is not empty
    if (!newExerciseName.trim()) {
      setAddExerciseError('Exercise name cannot be empty');
      return;
    }

    // Check for duplicate exercise names
    const exerciseNames = exercises.map(ex => ex.name.toLowerCase());
    if (exerciseNames.includes(newExerciseName.toLowerCase())) {
      setAddExerciseError(`This exercise already exists for ${displayName}`);
      return;
    }

    setIsAddingExercise(true);
    try {
      if (session?.access_token) {
        const newExercise = await addExercise(newExerciseName, muscleGroup.toLowerCase(), session.access_token);

        // Add the new exercise to the apiExercises list
        setApiExercises([...apiExercises, newExercise]);

        // Clear form and close modal
        setNewExerciseName('');
        setShowAddExerciseModal(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add exercise';
      setAddExerciseError(errorMessage);
    } finally {
      setIsAddingExercise(false);
    }
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
            <button
              onClick={handleGoBack}
              className="text-2xl font-bold text-primary hover:text-hm-dark cursor-pointer transition-colors"
              title="Go back to dashboard"
            >
              💪 Gym Tracker
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveWorkout}
              disabled={!isSaveWorkoutEnabled || isSaving}
              onMouseEnter={(e) => {
                if (isSaveWorkoutEnabled && !isSaving) {
                  e.currentTarget.style.backgroundColor = '#D84545';
                }
              }}
              onMouseLeave={(e) => {
                if (isSaveWorkoutEnabled && !isSaving) {
                  e.currentTarget.style.backgroundColor = '#C41E3A';
                }
              }}
              style={{
                backgroundColor: isSaveWorkoutEnabled && !isSaving ? '#C41E3A' : '#d1d5db',
              }}
              className="text-white font-bold py-2 px-4 rounded-lg transition-all disabled:cursor-not-allowed"
              title={!isSaveWorkoutEnabled ? getSaveWorkoutDisabledReason() : 'Save workout session'}
            >
              {isSaving ? 'Saving...' : 'Save Workout'}
            </button>
            <ThemeSwitcher />
          </div>
        </div>
      </div>

      {/* Save Messages */}
      {saveError && (
        <div className="bg-red-50 border-b border-red-200 px-4 md:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-600 text-sm font-medium">{saveError}</p>
          </div>
        </div>
      )}
      {saveMessage && (
        <div className="bg-green-50 border-b border-green-200 px-4 md:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-green-600 text-sm font-medium">{saveMessage}</p>
          </div>
        </div>
      )}
      {!isSaveWorkoutEnabled && loggedExercises.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 md:px-8 py-3">
          <div className="max-w-7xl mx-auto">
            <p className="text-yellow-700 text-sm font-medium">{getSaveWorkoutDisabledReason()}</p>
          </div>
        </div>
      )}

      {/* Main Content - Single column on mobile, 70/30 on desktop */}
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left side - Shows second on mobile, 70% on desktop */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-hm-light rounded-lg shadow-md p-4 sm:p-6 md:p-8">
              {/* Heading */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-hm-dark capitalize">
                  {displayName}
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddExerciseModal(true)}
                    className="text-xs sm:text-sm px-2 py-1 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors"
                  >
                    + Add Exercise
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="border-b border-gray-300 mb-6"></div>

              {/* Exercise Cards Grid - Scrollable Container */}
              <div className="h-[420px] sm:h-[400px] lg:h-[530px] overflow-y-auto">
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

          {/* Right side - Shows first on mobile, 30% on desktop */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-hm-light rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-hm-dark">Logged</h3>
                <button
                  onClick={loadPreviousWorkouts}
                  disabled={isLoadingPrevious}
                  className="text-xs sm:text-sm px-2 py-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition-colors disabled:opacity-50"
                >
                  {isLoadingPrevious ? 'Loading...' : 'Previous'}
                </button>
              </div>

              {/* Logged Exercises List - Scrollable Container */}
              <div className="overflow-y-auto max-h-[350px] sm:max-h-[400px] lg:max-h-[530px]">
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
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <p className="font-semibold text-hm-dark text-xs sm:text-sm truncate">
                            {entry.exerciseName}
                          </p>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => handleEditEntry(entry.id)}
                              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {entry.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-xs font-bold text-gray-700">{setIndex + 1}</span>
                              <div className="w-full px-2 py-1 bg-gray-200 rounded text-xs text-center text-gray-800 font-medium">
                                {set.kg || '—'}kg{set.reps ? ` × ${set.reps}` : ''}
                              </div>
                            </div>
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

      {showPreviousWorkouts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Previous {displayName} Workouts</h2>
              <button
                onClick={() => setShowPreviousWorkouts(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              {previousWorkouts.length === 0 ? (
                <p className="text-sm text-gray-600">No previous workouts found</p>
              ) : (
                previousWorkouts.map((workout) => (
                  <div key={workout.id} className="border-l-4 border-primary pl-3">
                    <p className="font-semibold text-sm">
                      {new Date(workout.created_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-gray-700">
                      {workout.workout_exercises?.map((exercise, idx) => (
                        <p key={idx}>
                          <span className="font-medium">{exercise.exercise_name}:</span>{' '}
                          {exercise.sets.length} sets{' '}
                          <span className="text-gray-600">
                            ({exercise.sets.map((s) => `${s.kg}kg × ${s.reps}`).join(', ')})
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Exercise to {displayName}</h2>
              <button
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setNewExerciseName('');
                  setAddExerciseError('');
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exercise Name
                </label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddExercise();
                    }
                  }}
                  placeholder="e.g., Dumbbell Curl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isAddingExercise}
                  autoFocus
                />
              </div>

              {addExerciseError && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {addExerciseError}
                </p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowAddExerciseModal(false);
                    setNewExerciseName('');
                    setAddExerciseError('');
                  }}
                  disabled={isAddingExercise}
                  className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExercise}
                  disabled={isAddingExercise || !newExerciseName.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingExercise ? 'Adding...' : 'Add Exercise'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
