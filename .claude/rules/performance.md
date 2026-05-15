# Performance Rules

## Rendering
- Memoize expensive components with `React.memo()`
- Use `useCallback` for callbacks passed to memoized children
- Use `useMemo` for expensive calculations
- Split state by update frequency (separate fast-changing from stable state)
- Lazy load components: `React.lazy(() => import('./Component'))`
- Virtualize long lists (100+ items) using react-window

## Bundle
- Tree-shake unused code (avoid side effects in modules)
- Use dynamic imports for large dependencies
- No unused dependencies in package.json
- Check bundle size regularly

## Network
- Debounce API requests: `debounce(fetchData, 300ms)`
- Implement pagination instead of loading all data
- Lazy load images: `<img loading="lazy" />`

## Code Splitting Strategy
- Split by route using React.lazy
- Split by feature for large features
- Common chunks (React, utilities) loaded first
- Analyze with webpack-bundle-analyzer
