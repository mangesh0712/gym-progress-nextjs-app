'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LogWorkoutModal } from '@/components/LogWorkoutModal';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { formatMuscleGroupName, exercises as staticExercises } from '@/lib/exercises';
import { saveWorkoutSession, isTokenExpired, refreshAccessToken, fetchExercises, Exercise } from '@/lib/supabase';

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
  const session = useAuthStore((state) => state.session);

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [loggedExercises, setLoggedExercises] = useState<LoggedEntry[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deleteConfirmingEntryId, setDeleteConfirmingEntryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [apiExercises, setApiExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

          {/* Right side - Shows first on mobile, 30% on desktop */}
          <div className="lg:col-span-1 order-1 lg:order-2">
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
