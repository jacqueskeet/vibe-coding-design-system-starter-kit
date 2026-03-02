# Prompt: Decision Capture

Use these prompts to document repeatable design system decisions in `DECISIONS.md`. This ensures agents apply your choices consistently across all future work.

---

## After Establishing a Pattern

```
I just made a decision that should apply to all future [components/tokens/styles].

Decision: [describe what you decided]
Context: [why you made this choice]
Applies to: [tokens, components, SCSS, framework wrappers, etc.]

Add this to DECISIONS.md so agents can reference it going forward.
```

---

## Review and Capture Session Decisions

```
Review the work we did in this session and identify any repeatable decisions
that should be documented in DECISIONS.md.

Look for:
- New patterns we established (variant naming, prop conventions, size scales)
- Token choices (color palette, spacing ramp, typography selections)
- Accessibility patterns we applied beyond WCAG minimums
- Animation, motion, or responsive conventions
- Component API patterns that should be consistent across future components
- Any "we always do it this way" choices I stated

For each decision found, suggest an entry for DECISIONS.md with:
- Decision: what was chosen
- Context: why
- Applies to: where it should be enforced
```

---

## Audit Existing Decisions

```
Read DECISIONS.md and audit the current codebase for consistency.

For each documented decision:
1. Check whether existing components, tokens, and styles follow it
2. Flag any violations with file path and line number
3. Suggest fixes for anything out of alignment

Report as: [CONSISTENT] or [VIOLATION] per decision with details.
```

---

## Import Decisions from Figma

```
I have design decisions documented in Figma. Extract the repeatable conventions
from the Figma file and format them as DECISIONS.md entries.

Look for:
- Color palette and usage rules
- Typography scale and hierarchy
- Spacing and layout grid conventions
- Component variant patterns
- Icon sizing and usage rules
- Border radius and elevation patterns

For each, create a DECISIONS.md entry with Decision, Context, and Applies to.
```

---

## Tips for Best Results

1. Document decisions as soon as they're made — don't wait until you forget the reasoning
2. Focus on **repeatable** decisions — one-off choices for a single component don't belong here
3. Include the "Context" (why) — agents need to understand intent, not just rules
4. Be specific in "Applies to" — vague scope leads to inconsistent application
5. Review `DECISIONS.md` periodically — remove outdated decisions, refine vague ones
6. The starter kit's architectural decisions live in `docs/ARCHITECTURE.md` Section 13 — `DECISIONS.md` is for **your project's** decisions on top of that foundation
