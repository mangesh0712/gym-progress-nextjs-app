export interface ExerciseItem {
  id: string;
  name: string;
  color: string;
}

export const exercises: Record<string, ExerciseItem[]> = {
  chest: [
    { id: 'chest-1', name: 'Incline DB Press', color: 'from-red-400 to-red-600' },
    { id: 'chest-2', name: 'Flat DB Press', color: 'from-red-500 to-red-700' },
    { id: 'chest-3', name: 'Cable Crossover', color: 'from-orange-400 to-orange-600' },
    { id: 'chest-4', name: 'Chest Flyes', color: 'from-orange-500 to-orange-700' },
  ],
  legs: [
    { id: 'legs-1', name: 'barbell Squats', color: 'from-blue-400 to-blue-600' },
    { id: 'legs-2', name: 'Leg Press', color: 'from-blue-500 to-blue-700' },
    { id: 'legs-3', name: 'Lunges', color: 'from-cyan-400 to-cyan-600' },
    { id: 'legs-4', name: 'Leg Extensions', color: 'from-cyan-500 to-cyan-700' },
    { id: 'legs-5', name: 'Leg curls', color: 'from-cyan-500 to-cyan-700' },
    { id: 'legs-6', name: 'Hip Thrusts', color: 'from-cyan-500 to-cyan-700' },
    { id: 'legs-7', name: 'Calf Raises', color: 'from-cyan-500 to-cyan-700' },
    { id: 'legs-8', name: 'Hip Abduction', color: 'from-cyan-500 to-cyan-700' },
    { id: 'legs-9', name: 'Hip Adduction', color: 'from-cyan-500 to-cyan-700' },
  ],
  shoulders: [
    { id: 'shoulders-1', name: 'Overhead DB Press', color: 'from-purple-400 to-purple-600' },
    { id: 'shoulders-2', name: 'Lateral Raises', color: 'from-purple-500 to-purple-700' },
    { id: 'shoulders-3', name: 'Rear Delt Flyes', color: 'from-pink-400 to-pink-600' },
    { id: 'shoulders-4', name: 'Arnold Press', color: 'from-pink-500 to-pink-700' },
  ],
  back: [
    { id: 'back-1', name: 'Seated Rows', color: 'from-green-400 to-green-600' },
    { id: 'back-2', name: 'Bent Over Rows', color: 'from-green-500 to-green-700' },
    { id: 'back-3', name: 'Deadlifts', color: 'from-emerald-400 to-emerald-600' },
    { id: 'back-4', name: 'Lat Pulldowns', color: 'from-emerald-500 to-emerald-700' },
    { id: 'back-5', name: 'Pull Ups', color: 'from-emerald-500 to-emerald-700' },
    { id: 'back-6', name: 'Shrugs', color: 'from-emerald-500 to-emerald-700' },
    { id: 'back-7', name: 'Hyper Extensions', color: 'from-emerald-500 to-emerald-700' },
  ],
  biceps: [
    { id: 'biceps-1', name: 'Preacher Curls', color: 'from-yellow-400 to-yellow-600' },
    { id: 'biceps-2', name: 'Dumbbell Curls', color: 'from-yellow-500 to-yellow-700' },
    { id: 'biceps-3', name: 'Hammer Curls', color: 'from-amber-400 to-amber-600' },
    { id: 'biceps-4', name: 'Reverse Curls', color: 'from-amber-500 to-amber-700' },
  ],
  triceps: [
    { id: 'triceps-1', name: 'Tricep Dips', color: 'from-indigo-400 to-indigo-600' },
    { id: 'triceps-2', name: 'Overhead Extenstions', color: 'from-indigo-500 to-indigo-700' },
    { id: 'triceps-3', name: 'Tricep Pushdowns', color: 'from-violet-400 to-violet-600' },
    { id: 'triceps-4', name: 'Underhead Extensions', color: 'from-violet-500 to-violet-700' },
  ],
  abs: [
    { id: 'abs-1', name: 'Crunches', color: 'from-teal-400 to-teal-600' },
    { id: 'abs-2', name: 'Planks', color: 'from-teal-500 to-teal-700' },
    { id: 'abs-3', name: 'Leg Raises', color: 'from-cyan-400 to-cyan-600' },
    { id: 'abs-4', name: 'Russian Twists', color: 'from-cyan-500 to-cyan-700' },
  ],
};

export function getExercisesForMuscleGroup(muscleGroup: string): ExerciseItem[] {
  return exercises[muscleGroup.toLowerCase()] || [];
}

export function formatMuscleGroupName(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}
