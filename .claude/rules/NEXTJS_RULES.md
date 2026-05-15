# Next.js Development Rules & Best Practices

## Project Structure
- Use **App Router** (not Pages Router) for all new routes
- Organize by feature: `app/[feature]/` contains all related routes, components, and utilities
- Keep shared components in `components/` at the root level
- Store utilities in `lib/` directory
- Place type definitions in `types/` directory
- Zustand stores in `store/` directory

## File Naming Conventions
- **Page files**: `page.tsx` (lowercase)
- **Layout files**: `layout.tsx` (lowercase)
- **Components**: PascalCase (e.g., `ExercisePicker.tsx`)
- **Utilities/helpers**: camelCase (e.g., `calculateProgress.ts`)
- **Type files**: end with `.types.ts` (e.g., `workout.types.ts`)
- **Stores**: end with `Store.ts` (e.g., `authStore.ts`)

## TypeScript Rules
- **No `any` types** — always provide explicit types
- **Explicit return types** on all functions
- **Optional fields** use `Type | null` or `Type | undefined` explicitly (not `?`)
- **Union types** preferred over overloads
- **Interfaces** for object contracts, **Types** for unions/aliases
- Use `readonly` for immutable data structures

Example:
```typescript
interface Workout {
  id: string;
  userId: string;
  date: Date;
  notes: string | null;
}

function logWorkout(workout: Workout): Promise<void> {
  // ...
}
```

## React/Component Rules
- **Functional components only** — no class components
- **Use hooks** for state (`useState`, `useEffect`, `useCallback`)
- **Dependencies array** must be exhaustive (ESLint rule enforced)
- **No console.log in production code** (use proper logging)
- **Memoize expensive computations** with `useMemo` and `useCallback`
- **Extract custom hooks** when reusing logic across 2+ components
- **Props interfaces** always come before component definition

Example:
```typescript
interface ExercisePickerProps {
  muscleGroup: string;
  onSelect: (exerciseIds: string[]) => void;
  disabled?: boolean;
}

export function ExercisePicker({ muscleGroup, onSelect, disabled }: ExercisePickerProps) {
  // ...
}
```

## Styling Rules
- **Tailwind CSS only** — no inline styles or CSS modules
- **DaisyUI components** for UI building blocks
- **Responsive design** using Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- **Dark mode** support via DaisyUI's `data-theme` attribute
- **Custom colors** defined in `tailwind.config.ts` only
- **No hardcoded colors** in components — use utility classes

Example:
```typescript
<button className="btn btn-primary btn-lg md:btn-md sm:btn-sm">
  Log Workout
</button>
```

## State Management (Zustand + Immer)
- **One store per domain** (e.g., `authStore.ts`, `splitStore.ts`, `sessionStore.ts`)
- **Immutable updates** using Immer middleware — never mutate state directly
- **Selectors** for accessing nested state (avoid spreading entire state)
- **Type-safe** with generics for store actions
- **Initialize with sensible defaults** — empty arrays/objects, not undefined

Example:
```typescript
interface SessionStore {
  exercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
}

export const useSessionStore = create<SessionStore>()(
  immer((set) => ({
    exercises: [],
    addExercise: (exercise) =>
      set((state) => {
        state.exercises.push(exercise);
      }),
    removeExercise: (exerciseId) =>
      set((state) => {
        state.exercises = state.exercises.filter((e) => e.id !== exerciseId);
      }),
  }))
);
```

## API & Data Fetching Rules
- **Server components** by default for data fetching
- **Client components** only when interactivity is needed (`'use client'`)
- **Fetch wrapper** in `lib/api.ts` — all API calls go through it
- **Error handling** — always catch and log errors, never silently fail
- **Loading states** — show spinner or skeleton while fetching
- **Cache strategies** — use `next/cache` for revalidation

Example:
```typescript
// lib/api.ts
export async function fetchWorkouts(userId: string): Promise<Workout[]> {
  const response = await fetch(`${API_URL}/workouts`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch workouts: ${response.status}`);
  return response.json();
}
```

## Forms & Input Handling
- **Validate on client** with libraries like `zod` or `react-hook-form`
- **Disable button during submission** to prevent duplicate requests
- **Clear sensitive data** from state after submission
- **Show success/error messages** in UI
- **Never trust user input** — validate on backend too

## Environment Variables
- Use `.env.local` for local development
- Use `.env.example` to document all required variables (without values)
- **Never commit `.env` files** — they contain secrets
- Access via `process.env.NEXT_PUBLIC_*` (client) or `process.env.*` (server)

## Performance Rules
- **Image optimization** — use `next/image` not `<img>`
- **Code splitting** — dynamic imports for heavy components via `next/dynamic`
- **Lazy loading** — use `loading="lazy"` on images below the fold
- **Bundle analysis** — check with `@next/bundle-analyzer` before deployment
- **Remove unused dependencies** — keep `package.json` clean

## Security Rules
- **No secrets in code** — use environment variables
- **Validate all inputs** — both client and server
- **CSRF protection** — for forms (Next.js handles automatically)
- **Rate limiting** — on API routes to prevent abuse
- **Sanitize user content** — if displaying user-generated content
- **JWT validation** — always verify tokens on protected routes

## Testing Rules
- **Unit tests** for utility functions and hooks
- **Integration tests** for API routes
- **E2E tests** for critical user flows (login, logging, progress view)
- **Minimum 80% coverage** for critical paths
- **Mock external APIs** — Supabase, FastAPI backend
- Use `jest` and `@testing-library/react`

## Accessibility Rules
- **Semantic HTML** — use correct tags (`<button>`, `<label>`, `<nav>`)
- **ARIA labels** — for icon buttons and interactive elements
- **Keyboard navigation** — all interactive elements must be keyboard accessible
- **Focus management** — visible focus indicators
- **Color contrast** — meet WCAG AA standards
- **Alt text** — on all images (can be empty string if decorative)

## Code Quality Rules
- **DRY principle** — extract repeated code into functions/components
- **Single Responsibility** — each function/component does one thing
- **Naming clarity** — function names should describe what they do
- **Comments only for WHY** — not WHAT (code should be self-documenting)
- **No commented-out code** — delete it, use git history if needed
- **Maximum 300 lines per component** — split if larger

## Git Conventions
- **Branch naming**: `feature/user-auth`, `fix/login-bug`, `refactor/store-cleanup`
- **Commit messages**: `feat: add phone OTP login`, `fix: reset form after submit`
- **PR descriptions**: include why the change is needed, not just what changed
- **Review before merge** — use the reviewer-agent for automated checks

## Environment Setup
```bash
npm install
npm install -D zustand immer
npm install -D tailwindcss postcss autoprefixer
npm install -D daisyui
npm install @supabase/supabase-js
npm install recharts
```

## Common Pitfalls to Avoid
- ❌ Using `useEffect` for data fetching in server components
- ❌ Mutating state directly in Zustand without Immer
- ❌ Forgetting to add dependencies to `useEffect` dependencies array
- ❌ Creating new object instances in component render (causes re-renders)
- ❌ Inline event handler functions without `useCallback`
- ❌ Hardcoding API URLs — use environment variables
- ❌ Not handling loading/error states
- ❌ Committing `.env` files to git

## Useful Resources
- [Next.js Official Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
