# Gym Progress Tracker — Plan

## Context
Personal gym tracking app for daily use **at the gym on mobile**. The app allows a single user to log gym sessions based on a customizable workout split, select exercises (with images) per muscle group, and track sets/reps per exercise. Progress is visualized over time per exercise.

**⚠️ CRITICAL REQUIREMENT:** All UI must be **fully responsive and mobile-optimized**. This app will be used on smartphones during gym sessions, so mobile UX is paramount. Test on actual mobile devices.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Frontend | Next.js 14 (App Router) | Full-stack, file-based routing |
| CSS | DaisyUI + Tailwind CSS | Pre-built components on Tailwind |
| Language | TypeScript | Type safety end-to-end |
| State | Zustand + Immer | Lightweight, immutable updates |
| Charts | Recharts | React-native charting library |
| Backend | Python + FastAPI | Clean REST API, free to host |
| Database | Supabase (PostgreSQL) | Free tier, built-in phone OTP auth |
| Auth | Supabase Phone OTP | SMS one-time password login |
| Frontend Host | Vercel | Free, optimized for Next.js |
| Backend Host | Render.com | Free tier, Python support |

---

## Database Schema

```sql
-- Users managed by Supabase Auth (phone OTP)

-- User's workout split configuration
splits
  id          UUID PK
  user_id     UUID REFERENCES auth.users(id)
  name        TEXT        -- e.g. "Push Pull Legs", "Bro Split"
  created_at  TIMESTAMPTZ

-- Days within a split
split_days
  id          UUID PK
  split_id    UUID REFERENCES splits(id) ON DELETE CASCADE
  day_number  INT         -- 1, 2, 3...
  label       TEXT        -- e.g. "Day 1 — Back & Chest"
  muscle_groups TEXT[]    -- ["back", "chest"]

-- Exercise library (seeded with images)
exercise_library
  id          UUID PK
  name        TEXT        -- e.g. "Bench Press"
  muscle_group TEXT       -- e.g. "chest"
  image_url   TEXT        -- CDN or public URL of exercise image
  description TEXT

-- A gym session (one day of working out)
workout_sessions
  id          UUID PK
  user_id     UUID REFERENCES auth.users(id)
  split_day_id UUID REFERENCES split_days(id)
  date        DATE
  notes       TEXT
  created_at  TIMESTAMPTZ

-- Individual exercise performance within a session
workout_exercises
  id          UUID PK
  session_id  UUID REFERENCES workout_sessions(id) ON DELETE CASCADE
  exercise_id UUID REFERENCES exercise_library(id)
  sets        JSONB       -- [{set: 1, reps: 10, weight: 60}, {set: 2, reps: 8, weight: 65}]
  created_at  TIMESTAMPTZ
```

> Row Level Security (RLS) on Supabase ensures users only access their own data.

---

## User Flow

1. **Onboarding:** User sets up their split (e.g., "Bro Split" with Day 1: Chest, Day 2: Back…)
2. **Logging a session:**
   - User picks the day (e.g., Monday → Chest Day)
   - App shows exercises for that muscle group from the library, with images
   - User selects which exercises they did (multi-select)
   - For each exercise, user logs sets: how many reps and what weight per set
3. **Progress view:** Charts show weight progression per exercise over time

---

## Frontend Structure

```
app/
  layout.tsx
  page.tsx                    — Home / redirect
  login/page.tsx              — Phone OTP login
  onboarding/page.tsx         — Set up workout split
  dashboard/page.tsx          — Today's session + quick stats
  log/
    page.tsx                  — Start a new session (pick split day)
    [sessionId]/page.tsx      — Log exercises & sets for a session
  progress/page.tsx           — Charts per exercise
  settings/page.tsx           — Manage split, days, muscle groups

components/
  ExercisePicker.tsx          — Multi-select grid of exercises with images
  SetLogger.tsx               — Input rows for sets/reps/weight
  ProgressChart.tsx           — Recharts line chart
  SplitDayCard.tsx            — Display a split day with muscle groups
  Navbar.tsx

store/
  authStore.ts                — Supabase session
  splitStore.ts               — Split and split days state
  sessionStore.ts             — Current workout session state

lib/
  supabase.ts                 — Supabase client
  api.ts                      — FastAPI fetch helpers
```

---

## Backend Structure (FastAPI)

```
app/
  main.py
  routers/
    splits.py         — CRUD for user splits and split days
    sessions.py       — POST/GET workout sessions
    exercises.py      — Log exercises within a session
    progress.py       — GET /progress/{exercise_id} for chart data
    library.py        — GET exercise library (filtered by muscle group)
  models/
    split.py
    session.py
    exercise.py
  db/supabase_client.py
  auth/middleware.py  — Supabase JWT validation
```

**Key API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/library?muscle_group=chest` | List exercises with images |
| POST | `/splits` | Create a workout split |
| GET | `/splits` | Get user's splits |
| POST | `/splits/{id}/days` | Add a day to a split |
| POST | `/sessions` | Start a new gym session |
| POST | `/sessions/{id}/exercises` | Log exercises + sets |
| GET | `/progress/{exercise_id}` | Historical set data for charts |

---

## Authentication Flow

1. User enters phone → Supabase sends OTP
2. User enters OTP → Supabase returns JWT
3. JWT stored in Zustand `authStore`
4. JWT sent as `Authorization: Bearer` on all FastAPI requests
5. FastAPI middleware validates JWT and extracts `user_id`

---

## Free Hosting Plan

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Vercel | Unlimited personal projects | Frontend |
| Render.com | 750 hrs/month | Backend — ~30s cold start after 15min idle |
| Supabase | 500MB DB, 50k MAU | Database + Auth |

---

## Implementation Phases

### Phase 1 — Project Setup
- Init Next.js (TypeScript, Tailwind, DaisyUI)
- Set up Supabase (schema, RLS, phone auth)
- Init FastAPI + Supabase Python client
- Set up Zustand + Immer stores

### Phase 2 — Auth
- Phone OTP login page
- Protected route middleware (Next.js)
- JWT middleware (FastAPI)

### Phase 3 — Split Configuration
- Onboarding: create split, add days, assign muscle groups
- Settings page to edit split later

### Phase 4 — Session Logging
- Pick today's split day
- Exercise picker grid (by muscle group, with images)
- Set/rep/weight entry per exercise
- Save session to Supabase via FastAPI

### Phase 5 — Progress Charts
- Fetch per-exercise history from FastAPI
- Recharts line chart (weight over time per set)
- Dashboard summary stats

### Phase 6 — Deployment
- Deploy frontend to Vercel
- Deploy FastAPI to Render.com
- Wire up environment variables

---

## Verification Plan

1. **Auth:** Phone OTP login works, JWT persists across page reloads
2. **Split setup:** Create a PPL split with 3 days and correct muscle groups
3. **Logging:** Log a chest day with Bench Press — 3 sets — weights saved correctly
4. **Progress:** Log Bench Press across 3 sessions, chart shows progression
5. **Security:** Unauthenticated FastAPI requests return 401
6. **Deployment:** Live Vercel URL loads, Render API responds (cold start acceptable)
