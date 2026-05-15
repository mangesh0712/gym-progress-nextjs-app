# Styling Rules & Best Practices

## Core Philosophy
**DRY (Don't Repeat Yourself)**: Never duplicate styles. Create reusable style utilities, CSS classes, or component abstractions. Tailwind's utility-first approach + custom CSS classes for common patterns.

---

## Tailwind CSS Setup

### tailwind.config.ts
Define all custom colors, spacing, fonts, and theme values here. Never hardcode values in components.

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [require('daisyui')],
};

export default config;
```

### DaisyUI Configuration
DaisyUI provides pre-built components. Use them instead of building from scratch.

```typescript
// In tailwind.config.ts
daisyui: {
  themes: ['light', 'dark'],
  darkMode: 'class',
}
```

---

## Global Styles (globals.css)

Define global variables, reusable CSS classes, and apply Tailwind:

```css
@import "tailwindcss";
@import "daisyui";

/* CSS Variables for consistency */
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-danger: #EF4444;
  --color-success: #10B981;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
}

/* Reusable utility classes (avoid in components) */
.container-center {
  @apply mx-auto px-4 md:px-6 lg:px-8;
}

.flex-center {
  @apply flex items-center justify-center;
}

.text-truncate {
  @apply truncate overflow-hidden text-ellipsis;
}

.btn-base {
  @apply px-4 py-2 rounded-lg font-medium transition-all duration-200;
}

.card-base {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6;
}

.input-base {
  @apply w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary;
}

/* Mobile-first responsive utilities */
@media (max-width: 640px) {
  .hidden-mobile {
    @apply hidden;
  }
}

@media (min-width: 641px) {
  .hidden-desktop {
    @apply hidden;
  }
}
```

---

## Component-Level Styles

### Use DaisyUI Components First
DaisyUI classes are pre-styled and optimized. Use them before creating custom styles.

```typescript
// ✅ Good: Using DaisyUI
<button className="btn btn-primary btn-lg">Log Workout</button>
<input type="text" className="input input-bordered w-full" />
<div className="card bg-base-100 shadow-xl">Content</div>

// ❌ Bad: Creating custom styles when DaisyUI has them
<button className="px-4 py-2 bg-blue-500 text-white rounded">Log</button>
```

### Use @apply for Component-Specific Reusable Styles
If a pattern repeats across components, extract it to globals.css with @apply, not in individual components.

```typescript
// globals.css
.exercise-card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow;
}

.exercise-card__title {
  @apply text-lg font-bold text-gray-900 dark:text-white;
}

.exercise-card__image {
  @apply w-full h-48 object-cover rounded-lg;
}
```

```typescript
// In component
export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <div className="exercise-card">
      <img src={exercise.image_url} className="exercise-card__image" alt={exercise.name} />
      <h3 className="exercise-card__title">{exercise.name}</h3>
    </div>
  );
}
```

### Avoid Repeating Tailwind Classes
Never write the same Tailwind classes in multiple components.

```typescript
// ❌ Bad: Repeating styles across components
function Component1() {
  return <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-white shadow-md">...</div>;
}

function Component2() {
  return <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-white shadow-md">...</div>;
}

// ✅ Good: Use globals.css class or DaisyUI
.card-container {
  @apply flex items-center justify-center gap-4 p-4 rounded-lg bg-white shadow-md;
}

function Component1() {
  return <div className="card-container">...</div>;
}

function Component2() {
  return <div className="card-container">...</div>;
}
```

---

## Responsive Design (Mobile-First)

### Tailwind Breakpoints
Always use mobile-first approach: write base styles for mobile, then add responsive prefixes.

```typescript
// ✅ Good: Mobile-first
<div className="text-sm md:text-base lg:text-lg">Responsive text</div>
<div className="flex flex-col md:flex-row gap-2 md:gap-4">Items</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">Grid</div>

// ❌ Bad: Desktop-first
<div className="text-lg md:text-base sm:text-sm">Wrong order</div>
```

### Common Responsive Patterns
```typescript
// Full-width on mobile, centered on desktop
<div className="w-full md:w-2/3 mx-auto">Content</div>

// Stack on mobile, row on desktop
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Left</div>
  <div className="w-full md:w-1/2">Right</div>
</div>

// Hide/show based on screen size
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>

// Touch-friendly buttons on mobile
<button className="p-3 md:p-2 text-base md:text-sm">Touch-friendly</button>
```

---

## Color System

### Using CSS Variables for Colors
Define colors once in `:root`, use everywhere:

```css
/* globals.css */
:root {
  --color-primary: #3B82F6;
  --color-secondary: #10B981;
  --color-danger: #EF4444;
  --color-warning: #F59E0B;
  --color-success: #10B981;
  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-900: #111827;
}

/* Use in components via Tailwind theme */
```

### Dark Mode Support
```typescript
// All DaisyUI components support dark mode automatically
// For custom styles, use dark: prefix

<div className="bg-white dark:bg-gray-800 text-black dark:text-white">
  Content adapts to theme
</div>
```

---

## Spacing System

Use consistent spacing from Tailwind's scale. Never use arbitrary values like `p-7` or `gap-13`.

```typescript
// ✅ Good: Use defined spacing scale
<div className="p-4 md:p-6 gap-2 md:gap-4">Content</div>

// ❌ Bad: Arbitrary spacing
<div className="p-7 gap-13">Content</div>
```

Define custom spacing in `tailwind.config.ts` if needed:

```typescript
spacing: {
  xs: '0.25rem',  // 4px
  sm: '0.5rem',   // 8px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
}
```

---

## Typography System

Define font sizes, weights, and line heights consistently:

```typescript
// tailwind.config.ts
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
}

fontWeight: {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
}
```

Usage:
```typescript
<h1 className="text-2xl font-bold">Heading</h1>
<p className="text-base font-normal">Body text</p>
<label className="text-sm font-medium">Label</label>
```

---

## Common Component Patterns

### Form Input
```typescript
// globals.css
.form-input {
  @apply w-full px-3 py-2 md:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}
```

### Button Variants
```typescript
// globals.css
.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors;
}

.btn-ghost {
  @apply px-4 py-2 text-primary hover:bg-primary/10 rounded-lg font-medium transition-colors;
}
```

### Card
```typescript
// globals.css
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6;
}

.card-header {
  @apply border-b border-gray-200 dark:border-gray-700 pb-4 mb-4;
}

.card-title {
  @apply text-lg md:text-xl font-bold text-gray-900 dark:text-white;
}
```

---

## No Hardcoded Values in Components

```typescript
// ❌ Bad: Hardcoded spacing and colors
<button className="px-4 py-2 bg-blue-500 text-white rounded">Click</button>

// ✅ Good: Use Tailwind utilities from config
<button className="btn btn-primary">Click</button>

// ✅ Good: Use DaisyUI component
<button className="btn btn-primary">Click</button>
```

---

## Shadow System

Use predefined shadow levels:

```typescript
// tailwind.config.ts
boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
}
```

Usage:
```typescript
<div className="shadow-md">Content</div>
<div className="shadow-lg hover:shadow-xl transition-shadow">Interactive</div>
```

---

## Animation & Transitions

```typescript
// tailwind.config.ts
animation: {
  fadeIn: 'fadeIn 0.3s ease-in',
  slideUp: 'slideUp 0.3s ease-out',
}

keyframes: {
  fadeIn: {
    'from': { opacity: '0' },
    'to': { opacity: '1' },
  },
  slideUp: {
    'from': { transform: 'translateY(10px)', opacity: '0' },
    'to': { transform: 'translateY(0)', opacity: '1' },
  },
}
```

Usage:
```typescript
<div className="animate-fadeIn">Content fades in</div>
<button className="hover:scale-105 transition-transform">Hover effect</button>
```

---

## CSS File Organization

```
frontend/
└── app/
    ├── globals.css          (Global styles, @apply utilities, CSS variables)
    ├── layout.tsx           (Root layout)
    └── page.tsx             (Home page)
```

**Never create component-specific CSS files.** All styles in `globals.css` using @apply or in Tailwind classes.

---

## Best Practices Summary

1. **Define once, use everywhere**: All colors, spacing, fonts in `tailwind.config.ts`
2. **Use @apply for repeated patterns**: Extract to `globals.css`, not in components
3. **Use DaisyUI components**: Before custom styles
4. **Mobile-first responsive**: Write mobile styles, add `md:`, `lg:` prefixes
5. **No hardcoded values**: Everything from config or Tailwind utilities
6. **No custom CSS files**: All styles in `globals.css`
7. **Dark mode support**: Use `dark:` prefix, DaisyUI handles it
8. **Touch-friendly on mobile**: Min 44px buttons/inputs
9. **CSS variables for consistency**: Use for colors, spacing, borders
10. **No class duplication**: Extract repeated Tailwind classes to @apply utilities

---

## Checklist Before Submitting Component

- [ ] All colors from Tailwind config (no hardcoded hex values)
- [ ] All spacing from Tailwind scale (no arbitrary px values)
- [ ] Font sizes and weights from config
- [ ] Responsive classes for mobile, tablet, desktop
- [ ] Dark mode support (dark: prefix where needed)
- [ ] No repeated Tailwind classes (extracted to @apply if repeated)
- [ ] Using DaisyUI components where applicable
- [ ] Touch-friendly buttons/inputs (min 44px height)
- [ ] No component-specific CSS files
- [ ] Semantic HTML used
