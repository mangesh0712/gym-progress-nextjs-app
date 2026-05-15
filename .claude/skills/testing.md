# Testing Skill

## Testing Types

**Unit Tests** - Individual functions/components in isolation (Jest/Vitest)
- Utility functions
- Pure functions
- Component rendering logic

**Integration Tests** - Multiple components/modules together (React Testing Library)
- Component interactions
- Form submissions
- API integration

**E2E Tests** - Complete user journeys (Cypress/Playwright)
- Critical user flows
- Cross-browser compatibility
- Real backend integration

## Best Practices

- Test user behavior, not implementation details
- Cover happy path + error cases
- Use proper assertions (screen.getByRole, expect(element).toBeInTheDocument())
- Keep tests isolated (no dependencies between tests)
- Aim for 80%+ coverage on critical paths, 70%+ overall
- Assert on visible output, not internal state

## Checklist

- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases tested
- [ ] User interactions work
- [ ] Async operations complete
- [ ] Loading/error states show
- [ ] No console errors
- [ ] Accessibility standards met

## Commands

```bash
npm test                    # Run tests
npm test -- --watch       # Watch mode
npm test -- --coverage    # With coverage
npm test -- --testNamePattern="login"  # Specific tests
```
