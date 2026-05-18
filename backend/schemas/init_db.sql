-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_created_at ON workout_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session_id ON workout_exercises(session_id);

-- Enable RLS (Row Level Security)
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own workouts
CREATE POLICY "Users can view their own workout sessions"
  ON workout_sessions
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own workout sessions"
  ON workout_sessions
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- RLS Policy: Users can only see exercises from their own workouts
CREATE POLICY "Users can view exercises from their own sessions"
  ON workout_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id AND user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert exercises to their own sessions"
  ON workout_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions
      WHERE id = session_id AND user_id = auth.uid()::text
    )
  );
