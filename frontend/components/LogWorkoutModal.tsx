import { useEffect } from 'react';
import { useWorkoutLoggingStore } from '@/store/workoutLoggingStore';

interface LogWorkoutModalProps {
  exerciseName: string;
  onSave: (sets: { kg: string; reps: string }[]) => void;
  onClose: () => void;
  initialSets?: { kg: string; reps: string }[];
}

export function LogWorkoutModal({ exerciseName, onSave, onClose, initialSets }: LogWorkoutModalProps) {
  const set1Kg = useWorkoutLoggingStore((state) => state.set1Kg);
  const set1Reps = useWorkoutLoggingStore((state) => state.set1Reps);
  const set2Kg = useWorkoutLoggingStore((state) => state.set2Kg);
  const set2Reps = useWorkoutLoggingStore((state) => state.set2Reps);
  const set3Kg = useWorkoutLoggingStore((state) => state.set3Kg);
  const set3Reps = useWorkoutLoggingStore((state) => state.set3Reps);

  const updateSet1Kg = useWorkoutLoggingStore((state) => state.updateSet1Kg);
  const updateSet1Reps = useWorkoutLoggingStore((state) => state.updateSet1Reps);
  const updateSet2Kg = useWorkoutLoggingStore((state) => state.updateSet2Kg);
  const updateSet2Reps = useWorkoutLoggingStore((state) => state.updateSet2Reps);
  const updateSet3Kg = useWorkoutLoggingStore((state) => state.updateSet3Kg);
  const updateSet3Reps = useWorkoutLoggingStore((state) => state.updateSet3Reps);
  const setSets = useWorkoutLoggingStore((state) => state.setSets);
  const resetSets = useWorkoutLoggingStore((state) => state.resetSets);

  useEffect(() => {
    if (initialSets) {
      setSets(initialSets);
    } else {
      resetSets();
    }
  }, [initialSets, setSets, resetSets]);

  const handleSave = () => {
    onSave([
      { kg: set1Kg, reps: set1Reps },
      { kg: set2Kg, reps: set2Reps },
      { kg: set3Kg, reps: set3Reps },
    ]);
    resetSets();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{exerciseName}</h2>

        {/* Set 1 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Set 1
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                kg
              </label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={set1Kg}
                onChange={(e) => updateSet1Kg(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                reps
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={set1Reps}
                onChange={(e) => updateSet1Reps(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Set 2 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Set 2
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                kg
              </label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={set2Kg}
                onChange={(e) => updateSet2Kg(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                reps
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={set2Reps}
                onChange={(e) => updateSet2Reps(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Set 3 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Set 3
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                kg
              </label>
              <input
                type="number"
                placeholder="e.g. 20"
                value={set3Kg}
                onChange={(e) => updateSet3Kg(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                reps
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={set3Reps}
                onChange={(e) => updateSet3Reps(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
