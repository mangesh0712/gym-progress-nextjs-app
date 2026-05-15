'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Split, SplitDay } from '@/types';

interface SplitState {
  splits: Split[];
  currentSplit: Split | null;
  splitDays: SplitDay[];
  isLoading: boolean;
  setSplits: (splits: Split[]) => void;
  setCurrentSplit: (split: Split | null) => void;
  setSplitDays: (days: SplitDay[]) => void;
  addSplit: (split: Split) => void;
  updateSplit: (split: Split) => void;
  removeSplit: (splitId: string) => void;
  addSplitDay: (day: SplitDay) => void;
  removeSplitDay: (dayId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useSplitStore = create<SplitState>()(
  immer((set) => ({
    splits: [],
    currentSplit: null,
    splitDays: [],
    isLoading: false,
    setSplits: (splits) =>
      set((state) => {
        state.splits = splits;
      }),
    setCurrentSplit: (split) =>
      set((state) => {
        state.currentSplit = split;
      }),
    setSplitDays: (days) =>
      set((state) => {
        state.splitDays = days;
      }),
    addSplit: (split) =>
      set((state) => {
        state.splits.push(split);
      }),
    updateSplit: (split) =>
      set((state) => {
        const index = state.splits.findIndex((s) => s.id === split.id);
        if (index !== -1) {
          state.splits[index] = split;
        }
      }),
    removeSplit: (splitId) =>
      set((state) => {
        state.splits = state.splits.filter((s) => s.id !== splitId);
      }),
    addSplitDay: (day) =>
      set((state) => {
        state.splitDays.push(day);
      }),
    removeSplitDay: (dayId) =>
      set((state) => {
        state.splitDays = state.splitDays.filter((d) => d.id !== dayId);
      }),
    setLoading: (loading) =>
      set((state) => {
        state.isLoading = loading;
      }),
  }))
);
