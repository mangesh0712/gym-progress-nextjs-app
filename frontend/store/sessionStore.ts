'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { WorkoutSession, WorkoutExercise, WorkoutSet } from '@/types';

interface SessionState {
  currentSession: WorkoutSession | null;
  exercises: WorkoutExercise[];
  isLoading: boolean;
  setCurrentSession: (session: WorkoutSession | null) => void;
  setExercises: (exercises: WorkoutExercise[]) => void;
  addExercise: (exercise: WorkoutExercise) => void;
  updateExerciseSets: (exerciseId: string, sets: WorkoutSet[]) => void;
  removeExercise: (exerciseId: string) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  immer((set) => ({
    currentSession: null,
    exercises: [],
    isLoading: false,
    setCurrentSession: (session) =>
      set((state) => {
        state.currentSession = session;
      }),
    setExercises: (exercises) =>
      set((state) => {
        state.exercises = exercises;
      }),
    addExercise: (exercise) =>
      set((state) => {
        state.exercises.push(exercise);
      }),
    updateExerciseSets: (exerciseId, sets) =>
      set((state) => {
        const exercise = state.exercises.find((e) => e.id === exerciseId);
        if (exercise) {
          exercise.sets = sets;
        }
      }),
    removeExercise: (exerciseId) =>
      set((state) => {
        state.exercises = state.exercises.filter((e) => e.id !== exerciseId);
      }),
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
    clearSession: () =>
      set((state) => {
        state.currentSession = null;
        state.exercises = [];
      }),
  }))
);
