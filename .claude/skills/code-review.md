# Code Review Skill

## Review Checklist

**Correctness**
- Logic handles edge cases
- No memory leaks or off-by-one errors
- Async operations properly handled
- Error handling is complete

**Type Safety**
- All variables explicitly typed
- No `any` types
- Return types explicit
- Null/undefined handled

**Performance**
- No unnecessary re-renders
- Proper use of memoization, useCallback, useMemo
- Dependency arrays complete
- No N+1 patterns

**React Patterns**
- Functional components with hooks
- Single responsibility per component
- Proper key props in lists
- State managed appropriately
- No hook calls in loops/conditions

**Testing**
- Critical paths tested (happy + error cases)
- 70%+ coverage for critical code
- No flaky tests
- User-behavior focused tests

**Security**
- No hardcoded secrets
- Input validation present
- XSS protection implemented
- Dependencies up to date

**Accessibility**
- Semantic HTML used
- ARIA labels present where needed
- Keyboard navigation works
- Sufficient color contrast (4.5:1+)

**Code Quality**
- Readable names, no commented code
- No console/debugger statements
- DRY principle followed
- No unnecessary complexity

## Output Format
```
✅ Approved / 🚧 Changes Requested / ❌ Blocked

**Issues Found**: [number]

For each issue:
- **Location**: [file:line]
- **Issue**: [description]
- **Severity**: critical | high | medium | low
- **Fix**: [suggestion]
```
