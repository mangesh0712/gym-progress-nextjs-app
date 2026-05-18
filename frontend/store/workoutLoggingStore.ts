import { create } from 'zustand';

interface WorkoutLoggingState {
  set1Kg: string;
  set1Reps: string;
  set2Kg: string;
  set2Reps: string;
  set3Kg: string;
  set3Reps: string;
  setSets: (sets: { kg: string; reps: string }[]) => void;
  updateSet1Kg: (value: string) => void;
  updateSet1Reps: (value: string) => void;
  updateSet2Kg: (value: string) => void;
  updateSet2Reps: (value: string) => void;
  updateSet3Kg: (value: string) => void;
  updateSet3Reps: (value: string) => void;
  resetSets: () => void;
  getSets: () => { kg: string; reps: string }[];
}

export const useWorkoutLoggingStore = create<WorkoutLoggingState>((set, get) => ({
  set1Kg: '',
  set1Reps: '',
  set2Kg: '',
  set2Reps: '',
  set3Kg: '',
  set3Reps: '',

  setSets: (sets: { kg: string; reps: string }[]) => {
    set({
      set1Kg: sets[0]?.kg ?? '',
      set1Reps: sets[0]?.reps ?? '',
      set2Kg: sets[1]?.kg ?? '',
      set2Reps: sets[1]?.reps ?? '',
      set3Kg: sets[2]?.kg ?? '',
      set3Reps: sets[2]?.reps ?? '',
    });
  },

  updateSet1Kg: (value: string) => set({ set1Kg: value }),
  updateSet1Reps: (value: string) => set({ set1Reps: value }),
  updateSet2Kg: (value: string) => set({ set2Kg: value }),
  updateSet2Reps: (value: string) => set({ set2Reps: value }),
  updateSet3Kg: (value: string) => set({ set3Kg: value }),
  updateSet3Reps: (value: string) => set({ set3Reps: value }),

  resetSets: () =>
    set({
      set1Kg: '',
      set1Reps: '',
      set2Kg: '',
      set2Reps: '',
      set3Kg: '',
      set3Reps: '',
    }),

  getSets: () => {
    const state = get();
    return [
      { kg: state.set1Kg, reps: state.set1Reps },
      { kg: state.set2Kg, reps: state.set2Reps },
      { kg: state.set3Kg, reps: state.set3Reps },
    ];
  },
}));
