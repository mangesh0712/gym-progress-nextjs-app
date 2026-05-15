# Documentation Skill

## Documentation Types

**README** - Entry point with features, installation, setup, usage examples

**Component Docs** - Props, examples, and usage patterns
```typescript
/**
 * Button Component - Customizable button with variants
 * @param label - Button text
 * @param onClick - Click handler
 * @param variant - Style variant (primary | secondary)
 */
const Button: React.FC<ButtonProps> = ({ label, onClick, variant }) => {}
```

**Hook Docs** - Purpose, parameters, return value, and example
```typescript
/**
 * useLocalStorage - Sync state with localStorage
 * @param key - Storage key
 * @param initialValue - Default value
 * @returns [value, setValue]
 */
function useLocalStorage<T>(key: string, initialValue: T)
```

**API Docs** - Endpoints, parameters, responses, error codes
```markdown
## GET /api/users/:id
- **Params**: id (required)
- **Response**: { id, name, email, role }
- **Errors**: 404 (not found), 401 (unauthorized)
```

**Architecture Docs** - System design, data flow, decision rationale

## Best Practices

- Keep docs up-to-date with code
- Provide clear examples
- Explain WHY decisions were made
- Remove outdated information
- Use clear heading hierarchy (H1 title, H2 sections, H3 subsections)
- Link to implementations

## Checklist

- [ ] README exists with setup instructions
- [ ] Components documented
- [ ] Hooks documented
- [ ] API documented
- [ ] Examples provided
- [ ] No broken links
- [ ] Contributing guidelines exist
