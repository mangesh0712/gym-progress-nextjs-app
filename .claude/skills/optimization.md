# Optimization Skill

## Key Metrics

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTI** (Time to Interactive): < 3.8s

## Optimization Techniques

**Bundle Size**
- Use tree-shaking
- Remove unused dependencies
- Implement code splitting with React.lazy()
- Use dynamic imports for large libraries
- Analyze with webpack-bundle-analyzer

**Component Performance**
- Memoize with React.memo()
- Use useCallback for callbacks
- Use useMemo for calculations
- Split state by update frequency
- Lazy load heavy components
- Virtualize lists (100+ items)

**Network**
- Debounce requests (300ms+)
- Implement pagination
- Lazy load images
- Cache with React Query or SWR
- Compress assets (gzip, brotli)

**Rendering**
- Remove layout thrashing
- Batch DOM updates
- Use requestAnimationFrame
- Debounce resize handlers
- Use CSS animations instead of JS

## Profiling Workflow

1. Measure baseline with Lighthouse/DevTools
2. Identify slowest operations (React DevTools Profiler)
3. Apply specific techniques
4. Measure improvement
5. Deploy and monitor

## Tools

```bash
lighthouse https://your-site.com --view
webpack-bundle-analyzer dist/
npm test -- --coverage
```
