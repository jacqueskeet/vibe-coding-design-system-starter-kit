# Component Accessibility Checklist

Use this checklist when creating or reviewing any design system component. All items must pass for WCAG 2.2 AA compliance.

---

## Semantic HTML

- [ ] Uses the most appropriate semantic HTML element (e.g., `<button>` not `<div onClick>`)
- [ ] Headings follow a logical hierarchy (`h1` → `h2` → `h3`)
- [ ] Lists use `<ul>`/`<ol>`/`<li>` elements
- [ ] Tables use `<table>`, `<thead>`, `<th>` with `scope` attributes
- [ ] Form fields use `<label>` elements with `for`/`htmlFor` association

## ARIA

- [ ] `role` attribute only used when no semantic HTML element fits
- [ ] `aria-label` or `aria-labelledby` on elements without visible text labels
- [ ] `aria-describedby` for supplementary descriptions (e.g., error messages, help text)
- [ ] `aria-expanded` on elements that toggle visibility of other content
- [ ] `aria-controls` linking triggers to the content they control
- [ ] `aria-current` for navigation items indicating current page/step
- [ ] `aria-disabled` preferred over `disabled` attribute (keeps focusability)
- [ ] `aria-busy` on loading states
- [ ] `aria-live` regions for dynamic content updates
- [ ] No redundant ARIA (e.g., `role="button"` on a `<button>`)

## Keyboard

- [ ] All interactive elements reachable via Tab key
- [ ] Tab order matches visual reading order
- [ ] Enter and/or Space activate buttons and links
- [ ] Escape closes modals, dropdowns, popovers
- [ ] Arrow keys navigate within composite widgets (tabs, menus, radio groups)
- [ ] No keyboard traps — user can always Tab away
- [ ] Shift+Tab works in reverse order
- [ ] Home/End keys jump to first/last item in lists (where applicable)

## Focus

- [ ] Visible focus indicator on every focusable element
- [ ] Focus indicator uses `var(--vcds-focus-ring)` token
- [ ] Focus indicator has 3:1 contrast ratio against adjacent colors
- [ ] Focus is trapped inside modals/dialogs when open
- [ ] Focus is restored to trigger element when modal/dialog closes
- [ ] Focus moves logically when content is added/removed dynamically
- [ ] Skip links provided for complex navigation (if applicable)

## Color & Contrast

- [ ] Text color meets 4.5:1 contrast ratio against background
- [ ] Large text (≥18pt or ≥14pt bold) meets 3:1 contrast ratio
- [ ] UI components and graphical elements meet 3:1 contrast ratio
- [ ] Color is NOT the sole indicator of state (e.g., error = red + icon + text)
- [ ] Component works in all three themes (light, dark, high-contrast)
- [ ] All color values come from semantic tokens, not hardcoded

## Content

- [ ] Images have `alt` text (or `alt=""` + `aria-hidden="true"` if decorative)
- [ ] Icons have `aria-hidden="true"` when used alongside text labels
- [ ] Icons have `aria-label` when used as the sole content of a button
- [ ] Error messages are descriptive and associated with the invalid field
- [ ] Instructions don't rely on sensory characteristics alone ("click the red button")

## Motion & Animation

- [ ] Animations respect `prefers-reduced-motion` media query
- [ ] No content flashes more than 3 times per second
- [ ] Auto-playing content can be paused, stopped, or hidden
- [ ] Transitions are under 5 seconds or can be disabled

## Touch & Pointer

- [ ] Touch targets are at least 44×44 CSS pixels
- [ ] Adequate spacing between adjacent touch targets (at least 8px)
- [ ] Hover-triggered content also accessible via focus
- [ ] No functionality requires specific pointer gestures (e.g., pinch)

## Testing

- [ ] Passes axe-core automated checks (0 violations)
- [ ] Tested with keyboard-only navigation
- [ ] Tested in high-contrast theme
- [ ] Tested with browser zoom at 200%
- [ ] Tested with `prefers-reduced-motion: reduce`
