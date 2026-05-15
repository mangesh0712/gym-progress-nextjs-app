# TypeScript Standards

## Strict Checking
- Enable strict mode in tsconfig.json
- No `any` types - use `unknown` if needed
- Explicit return types on all functions
- Explicit type annotations on variables

## Types vs Interfaces
- **Interfaces**: Object shapes and class contracts
- **Types**: Unions, primitives, and aliases
- Use `extends` for interface inheritance

## Generics
Use for reusable utilities and components:
```typescript
function getById<T extends { id: string }>(items: T[], id: string): T | undefined
function List<T>({ items, renderItem }: ListProps<T>)
```

## Utility Types
- `Partial<T>` - All optional properties
- `Pick<T, K>` - Select specific properties
- `Omit<T, K>` - Exclude specific properties
- `Record<K, V>` - Object with specific keys
- `Readonly<T>` - Make properties readonly

## Null/Undefined Handling
- Always check explicitly: `value !== null && value !== undefined`
- Use nullish coalescing: `port ?? 3000`
- Use optional chaining: `user?.profile?.email`

## Const Assertions
Use `as const` for literal types:
```typescript
const roles = ['admin', 'user', 'guest'] as const;
type Role = (typeof roles)[number];
```

## Union Types Over Enums
Prefer discriminated unions:
```typescript
type Status = 'pending' | 'success' | 'error';
```
