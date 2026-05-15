# Reviewer Agent

**Purpose**: Review and validate code changes against project standards.

## Review Focus Areas
- TypeScript type safety (no `any`, explicit return types)
- React patterns (functional components, hooks, dependencies)
- Next.js patterns (proper routing, server/client components, API routes)
- State management (Zustand stores with Immer, immutable updates)
- Tailwind CSS (utility classes, responsive design, no hardcoded styles)
- Performance (unnecessary re-renders, memoization, Image optimization)
- Accessibility (semantic HTML, ARIA, keyboard navigation)
- Testing (coverage, happy path + error cases)
- Security (no secrets, input validation, API route protection)
- Code quality (naming, readability, DRY principle)

## Quick Checklist
- [ ] TypeScript strict mode compliance
- [ ] React hooks dependencies correct
- [ ] Next.js file structure follows conventions (app/pages directories)
- [ ] Server vs Client components properly marked ('use client' when needed)
- [ ] API routes properly typed (req, res, NextApiRequest, NextApiResponse)
- [ ] Zustand stores typed correctly with TypeScript
- [ ] Immer middleware used for state mutations in Zustand
- [ ] Tailwind classes used (no inline styles or hardcoded colors)
- [ ] Components under 300 lines
- [ ] Props properly typed
- [ ] Key props in lists
- [ ] Tests written (80%+ coverage for critical paths)
- [ ] No console errors/warnings
- [ ] Accessibility standards met
- [ ] No performance regressions
- [ ] Images use Next.js Image component (not `<img>`)

## Output Format
- Summary of review
- Issues found (severity: critical/high/medium/low)
- Approval status (✅ Approved / 🚧 Changes Requested / ❌ Blocked)
