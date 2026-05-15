export interface Split {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface SplitDay {
  id: string;
  split_id: string;
  day_number: number;
  label: string;
  muscle_groups: string[];
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  image_url: string;
  description?: string | null;
}

export interface WorkoutSet {
  set: number;
  reps: number;
  weight: number;
}

export interface WorkoutExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  sets: WorkoutSet[];
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  split_day_id: string;
  date: string;
  notes?: string | null;
  created_at: string;
  exercises?: WorkoutExercise[];
}

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
}
