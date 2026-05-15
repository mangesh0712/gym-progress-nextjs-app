# Prompting Guide - Using Documentation Effectively

**How to reference documentation in prompts to save tokens and maintain context.**

---

## 🎯 Quick Reference Strategy

Instead of copying entire files into prompts, reference them strategically:

### Strategy 1: Task-Specific References (Recommended)
**Best for**: Most development tasks (saves 70-80% tokens)

```
Task: "Add a new Button component"

Use case: When you only need specific standards:

Prompt:
"Add a new Button component following:
- style.md (component structure)
- .claude/rules/react-best-practices.md (React patterns)
- .claude/skills/accessibility.md (a11y standards)

Requirements:
- TypeScript typed props
- Semantic button element
- Keyboard accessible"
```

**Why it works**: Claude loads entire CLAUDE.md file context automatically, so specific rules are available without copying.

---

### Strategy 2: Process-Based References
**Best for**: Multi-step tasks like code review, testing, optimization

```
Task: "Review this component for quality"

Prompt:
"Review this component using:
- .claude/agents/reviewer-agent.md (review process)
- .claude/skills/code-review.md (checklist)

Focus on: TypeScript, performance, accessibility"
```

---

### Strategy 3: Full Context Reference
**Best for**: Complex architectural work, refactoring, setting standards

```
Task: "Design architecture for new feature"

Prompt:
"Design the architecture following project standards:

Context files:
- CLAUDE.md (overview)
- .claude/rules/* (all standards)
- style.md (code structure)

Deliverables:
- Component hierarchy
- File structure
- Type definitions"
```

---

## 📊 Token Efficiency Comparison

### ❌ Inefficient (No references)
```
Prompt: Copies entire component + entire style.md + entire rules
Cost: 2000-3000 tokens
Result: Redundant context, slower response
```

### ✅ Efficient (Smart references)
```
Prompt: Brief requirement + specific file references
Cost: 200-400 tokens
Result: Fast, focused, accurate response
```

### 💡 Best Practice (Context-aware references)
```
Prompt: Task description + file names (not paths)
Cost: 100-300 tokens
Result: Claude loads CLAUDE.md automatically, finds references
```

---

## 🔍 How to Reference Each Document Type

### For Style & Formatting Questions
```
Reference: "style.md"
Use when: Code formatting, naming conventions, imports, component structure
Don't copy: Just mention the file name
Example: "Format this component following style.md"
```

### For React & TypeScript Standards
```
Reference: ".claude/rules/react-best-practices.md"
Reference: ".claude/rules/typescript-standards.md"
Use when: Implementing React components, using hooks, types
Don't copy: Just mention which rule applies
Example: "Implement this hook following react-best-practices.md"
```

### For Performance Optimization
```
Reference: ".claude/rules/performance.md"
Use when: Optimizing component, bundle, or network
Don't copy: Just mention the guideline
Example: "Optimize this using performance.md guidelines (memoization, lazy loading)"
```

### For Code Reviews
```
Reference: ".claude/agents/reviewer-agent.md"
Reference: ".claude/skills/code-review.md"
Use when: Reviewing code, checking standards, validation
Example: "Review this component against .claude/skills/code-review.md checklist"
```

### For Testing
```
Reference: ".claude/skills/testing.md"
Use when: Writing tests, planning test strategy
Example: "Write tests following .claude/skills/testing.md (unit + integration)"
```

### For Accessibility
```
Reference: ".claude/skills/accessibility.md"
Use when: Implementing accessible features, ARIA labels, keyboard nav
Example: "Make this accessible following .claude/skills/accessibility.md"
```

---

## 📝 Prompt Template Examples

### Task: Add New Component

```
I need to add a [ComponentName] component.

Follow:
- style.md: component structure
- react-best-practices.md: React patterns
- accessibility.md: a11y standards
- typescript-standards.md: typing

Requirements:
- [Specific requirement 1]
- [Specific requirement 2]

Here's the design/mockup:
[Design details]
```

**Estimated tokens**: 400-600

---

### Task: Code Review

```
Review this code against:
- reviewer-agent.md: review process
- code-review.md: checklist
- react-best-practices.md: patterns
- typescript-standards.md: types
- performance.md: optimization

Focus on: [specific areas if any]

Code to review:
[Code snippet]
```

**Estimated tokens**: 600-800

---

### Task: Optimize Performance

```
Optimize this component using:
- performance.md: guidelines
- optimization.md: process

Current issue: [describe problem]
Goal: [what metric/improvement]

Code:
[Code to optimize]
```

**Estimated tokens**: 500-700

---

### Task: Research Feature

```
Research [topic] following:
- research-agent.md: methodology
- research.md: process

Questions:
- [Question 1]
- [Question 2]
- [Question 3]

Provide:
- Key findings
- Comparison of options
- Recommendation with rationale
```

**Estimated tokens**: 300-500

---

## 🚀 Advanced: Context Stacking

Use multiple references for complex tasks without bloating prompts:

```
Multi-file reference (efficient):
Prompt: "Implement new feature using:
  - style.md
  - react-best-practices.md
  - typescript-standards.md
  - performance.md
  - accessibility.md
  - testing.md"

Cost: ~500 tokens
Benefit: Claude references all standards automatically
```

---

## 📌 Pro Tips

1. **Always mention CLAUDE.md implicitly** - It's the index, Claude knows to reference it
2. **Use file names, not full paths** - `react-best-practices.md` not `.claude/rules/react-best-practices.md`
3. **Be specific about what you need** - Don't reference entire files, say what aspect
4. **Chain references for workflows** - reviewer-agent → code-review → specific rules
5. **Use skill documents for processes** - testing.md, documentation.md for how-to guidance
6. **Use rule documents for standards** - react-best-practices.md, typescript-standards.md for what-to-do

---

## 💬 Example Complete Prompt

```
Task: Build a form component for user registration

Follow these standards:
- style.md: component & file structure
- react-best-practices.md: hooks, state management
- typescript-standards.md: prop types
- accessibility.md: form labels, keyboard nav
- testing.md: form validation tests

Requirements:
- Email & password fields
- Form validation (client-side)
- Error display
- Submit button (disabled while loading)
- Success message

User stories:
1. User enters email & password, clicks submit
2. Form shows validation errors if invalid
3. Submit button disables during loading
4. Success message shows on completion
5. Form is fully keyboard accessible
6. Screen reader friendly

Acceptance criteria:
- All TypeScript types explicit
- Component under 200 lines
- 80%+ test coverage
- WCAG AA compliant
```

**Total prompt**: ~600 tokens  
**Without references** (full copy/paste): 3000+ tokens  
**Savings**: 80%+ tokens while maintaining full context! 🎉

---

## ❓ FAQ

**Q: Should I copy the entire rule file into the prompt?**  
A: No! Just mention the file name. Claude has access to your project files.

**Q: What if I need a specific rule from multiple files?**  
A: List them: "Follow react-best-practices.md, typescript-standards.md, and performance.md"

**Q: Do I always need to reference CLAUDE.md?**  
A: No, it's implicit. Reference specific documents you need.

**Q: Can I reference files that don't exist yet?**  
A: No, only reference files in .claude/ that actually exist.

**Q: How specific should I be?**  
A: Be specific enough to avoid ambiguity but general enough for flexibility.

---

## 🎯 Summary

- ✅ Reference by file name (not full path)
- ✅ Mention 2-5 specific documents per prompt
- ✅ Use skill docs for "how-to" guidance
- ✅ Use rule docs for "what-to-do" standards
- ✅ Let Claude load context automatically
- ❌ Don't copy entire files
- ❌ Don't over-reference (more isn't better)
- ❌ Don't reference files that don't apply to task

**Result**: Focused prompts, full context, maximum token efficiency 🚀
