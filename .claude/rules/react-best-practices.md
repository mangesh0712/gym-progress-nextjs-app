# React Best Practices

## Core Rules

**Functional Components Only** - Use hooks, never class components.

**Single Responsibility** - One clear responsibility per component, max 300 lines.

**Explicit Props Typing** - Always use TypeScript interfaces for props.

**Hook Dependencies** - Include complete dependency arrays in useEffect/useCallback.

**Stable Keys in Lists** - Use unique IDs, never array indices.

**Local State First** - Only lift state when multiple components need it.

**Immutable Updates** - Never mutate state directly; create new objects/arrays.

**Memoization** - Use React.memo() for expensive components, useCallback for callbacks.

**Error Boundaries** - Wrap error-prone areas to prevent app-wide crashes.

**Semantic HTML** - Use proper HTML elements (header, nav, main, article, footer).

**ARIA Labels** - Add aria-label/aria-describedby when semantic HTML isn't sufficient.

**Keyboard Navigation** - Ensure all interactive elements work with keyboard.

**Test User Behavior** - Test what users see/do, not internal state.

## File Structure
```
src/
├── components/sections/  (page sections)
├── components/common/    (reusable components)
├── components/layouts/   (layout wrapper)
├── hooks/
├── utils/
├── types/
├── services/            (API calls)
├── constants/
└── styles/
```

## Naming
- Components: PascalCase (Button.tsx, UserProfile.tsx)
- Utilities/Hooks: camelCase (formatDate.ts, useAuth.ts)
- Classes: kebab-case (.card, .card__title)
