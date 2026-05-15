# Accessibility Skill

## WCAG 2.1 Standards

**Level A** - Keyboard accessible, color contrast, text alternatives, heading hierarchy

**Level AA** - Minimum 4.5:1 contrast, resizable text, no seizure triggers (target)

**Level AAA** - Enhanced 7:1 contrast, sign language, extended descriptions

## Core Principles

**Perceivable** - Users can see/hear content
- Images have alt text
- Videos have captions
- Sufficient color contrast (4.5:1+)

**Operable** - Users can navigate with keyboard
- Tab through interactive elements
- Enter/Space trigger buttons
- Escape closes modals
- Focus indicators visible

**Understandable** - Content is clear
- Clear labels on inputs
- Error messages explain issues
- Consistent navigation
- Simple language

**Robust** - Works with assistive tech
- Semantic HTML (header, nav, main, footer)
- Proper ARIA roles/labels
- Valid HTML/CSS
- Works across browsers

## Implementation

**Semantic HTML**
```tsx
<header /> <nav /> <main /> <article /> <section /> <footer />
<button /> <a /> <input /> <label /> <form />
```

**ARIA**
```tsx
aria-label="Close menu"
aria-describedby="hint"
aria-expanded={isOpen}
role="alert" aria-live="polite"
```

**Keyboard Navigation**
- All interactive elements tabbable
- Buttons respond to Enter/Space
- Focus trap in modals
- Focus indicator visible (2px outline)

## Testing

- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Check contrast with WebAIM Color Checker
- Run axe, Lighthouse accessibility audits
- Test with actual users with disabilities

## Checklist

- [ ] Keyboard navigation works
- [ ] Color contrast 4.5:1+
- [ ] Focus indicators visible
- [ ] Images have alt text
- [ ] Form labels present
- [ ] Error messages announced
- [ ] Headings in order
- [ ] No seizure triggers
- [ ] ARIA correct
- [ ] Tests pass
