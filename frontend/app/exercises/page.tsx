'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchExercises, addExercise, deleteExercise, Exercise } from '@/lib/supabase';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const muscleGroupsList = ['chest', 'legs', 'shoulders', 'back', 'biceps', 'triceps', 'abs'];

export default function ExercisesPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const session = useAuthStore((state) => state.session);

  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('chest');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    loadExercises();
  }, [selectedMuscleGroup, session?.access_token]);

  const loadExercises = async () => {
    try {
      if (session?.access_token) {
        setIsLoading(true);
        const data = await fetchExercises(selectedMuscleGroup, session.access_token);
        setExercises(data);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim() || !session?.access_token) return;

    try {
      setIsAdding(true);
      const newExercise = await addExercise(newExerciseName, selectedMuscleGroup, session.access_token);
      setExercises([...exercises, newExercise]);
      setNewExerciseName('');
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('Failed to add exercise');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!session?.access_token) return;

    try {
      await deleteExercise(exerciseId, session.access_token);
      setExercises(exercises.filter(e => e.id !== exerciseId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('Failed to delete exercise');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-ghost btn-sm"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-primary">Manage Exercises</h1>
          </div>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Muscle Group Selector - Horizontal Scroll Pills */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Body Part</span>
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {muscleGroupsList.map((group) => (
                <button
                  key={group}
                  onClick={() => {
                    setSelectedMuscleGroup(group);
                    setNewExerciseName('');
                  }}
                  className={`btn btn-sm whitespace-nowrap ${
                    selectedMuscleGroup === group
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Add Exercise Form */}
          <div className="card bg-base-200 shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Add New Exercise</h3>
            <form onSubmit={handleAddExercise} className="space-y-3">
              <input
                type="text"
                placeholder="Exercise name (e.g., Barbell Curl)"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                className="input input-bordered w-full"
                disabled={isAdding}
              />
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isAdding || !newExerciseName.trim()}
              >
                {isAdding ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Adding...
                  </>
                ) : (
                  '+ Add Exercise'
                )}
              </button>
            </form>
          </div>

          {/* Exercises List */}
          <div className="card bg-base-100 shadow-md p-4 md:p-6">
            <h3 className="text-lg font-bold mb-4">
              {selectedMuscleGroup.charAt(0).toUpperCase() + selectedMuscleGroup.slice(1)} Exercises
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No exercises yet. Add one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                  >
                    <span className="font-medium">{exercise.name}</span>
                    <button
                      onClick={() => setDeleteConfirm(exercise.id)}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card bg-base-100 shadow-xl max-w-sm w-full">
            <div className="card-body">
              <h2 className="card-title">Delete Exercise?</h2>
              <p className="text-sm text-gray-600">This action cannot be undone.</p>
              <div className="card-actions justify-end gap-2 mt-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteExercise(deleteConfirm)}
                  className="btn btn-error btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
