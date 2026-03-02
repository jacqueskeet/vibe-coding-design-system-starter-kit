# Prompt: Accessibility Audit

---

## Full Component Audit

```
Perform a comprehensive accessibility audit on the [ComponentName] component.

Check against:
1. The checklist in /a11y/checklists/component.md
2. WCAG 2.2 AA success criteria
3. WAI-ARIA Authoring Practices Guide patterns

Audit all three framework implementations:
- packages/react/src/components/[ComponentName]/
- packages/vue/src/components/[ComponentName]/
- packages/svelte/src/components/[ComponentName]/

For each issue found, report:
- Severity: Critical / Major / Minor
- WCAG criterion violated
- The specific file and line
- How to fix it
- Code example of the fix

Also check:
- Keyboard navigation (Tab, Enter, Space, Escape, Arrow keys as applicable)
- Screen reader announcements (test with NVDA/VoiceOver mental model)
- Color contrast ratios for all color token combinations used
- Focus indicator visibility using --ds-focus-ring token
- Touch target sizes (minimum 44x44px)
- Reduced motion support (@media (prefers-reduced-motion))
- High contrast theme compatibility
```

---

## Quick Color Contrast Check

```
Check all color token pairs used in [ComponentName] for WCAG 2.2 AA compliance:

- Text colors against their background surfaces (4.5:1 ratio for normal text)
- UI element colors against backgrounds (3:1 ratio)
- Focus indicator contrast (3:1 ratio against adjacent colors)

Reference the token values in:
- packages/tokens/src/semantic/light.json (light theme)
- packages/tokens/src/semantic/dark.json (dark theme)
- packages/tokens/src/semantic/high-contrast.json (high contrast)

Report any failing pairs with their actual ratio and the required ratio.
```

---

## Keyboard Navigation Audit

```
Audit the keyboard interaction patterns for [ComponentName]:

1. Can all interactive elements be reached via Tab?
2. Is the tab order logical and matches visual order?
3. Do Enter and Space activate the expected actions?
4. Does Escape close/dismiss where expected?
5. Do Arrow keys navigate within composite widgets?
6. Is there a visible focus indicator on every focusable element?
7. Are there any keyboard traps?
8. Does Shift+Tab work in reverse?

Compare against the WAI-ARIA APG pattern for this component type:
https://www.w3.org/WAI/ARIA/apg/patterns/

Check all three framework implementations for consistency.
```
