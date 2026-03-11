# Prompt: QA Checklist

Use these prompts to run quality checks after component creation, token changes, or any design system updates. Reference `skills/qa.md` for the full QA skill procedures.

---

## Component QA (Full)

```
Run a full QA check on the [ComponentName] component.

Step 0 — Component metadata:
1. Verify packages/css-components/src/components/[component-name].meta.json exists
2. Run: pnpm validate:metadata — verify it passes schema validation
3. Check that all variant names in the SCSS have matching entries in variants section
4. Check that intent.purpose is filled in (not a TODO placeholder)
5. Check that accessibility.role matches the rendered HTML element role
6. Check that composition.requires matches actual required children/slots

Step 1 — SCSS:
1. Build: pnpm --filter @vcds/css-components build
2. Lint: pnpm --filter @vcds/css-components lint
3. Read packages/css-components/src/components/_[component-name].scss
4. Verify BEM naming uses #{cfg.$prefix}-[component-name] pattern
5. Verify all values use semantic tokens (var(--#{cfg.$prefix}-*)) — no hex, no raw px, no primitives
6. Verify @use '../config' as cfg; is present
7. Verify component is registered in packages/css-components/src/index.scss

Step 2 — HTML reference:
1. Verify packages/html/examples/[component-name].html exists
2. Check it shows all variants, sizes, and states
3. Check it uses the prefix from ds.config.json
4. Check it includes correct ARIA attributes

Step 3 — Framework wrappers (all three):
For each of React, Vue, Svelte:
1. Verify file exists in packages/{react,vue,svelte}/src/components/[ComponentName]/
2. Verify it imports cls or DS_PREFIX from @vcds/shared/prefix
3. Verify NO hardcoded prefix strings
4. Verify NO <style> blocks, NO CSS Modules, NO inline styles for visuals
5. Verify props map to BEM classes correctly
6. Verify ...rest props are spread onto root element
7. React only: verify forwardRef and displayName
8. Vue only: verify defineOptions({ name: 'Ds[ComponentName]' })
9. Svelte only: verify $props() rune

Step 4 — Cross-framework parity:
1. Compare prop names and types across all three frameworks
2. Compare default values (variant, size, booleans)
3. Compare BEM class output for the same prop combinations
4. Compare ARIA attribute behavior
5. Compare disabled/loading interaction handling

Step 5 — Types:
1. React: types in [ComponentName].types.ts, re-exported from index.ts
2. Vue: types in <script setup> with TypeScript interface
3. Svelte: Props interface in <script lang="ts">

Step 6 — Tests:
1. Run: pnpm --filter @vcds/react test
2. Run: pnpm --filter @vcds/vue test
3. Run: pnpm --filter @vcds/svelte test
4. Verify each test covers: rendering, variants, sizes, interactions, prefix, axe-core

Step 7 — Story:
1. Verify packages/docs/src/[ComponentName].stories.tsx exists
2. Check it has stories for each variant, size, and special states

Reference the golden Button component for expected patterns:
- Metadata: packages/css-components/src/components/button.meta.json
- SCSS: packages/css-components/src/components/_button.scss
- React: packages/react/src/components/Button/Button.tsx
- Vue: packages/vue/src/components/Button/DsButton.vue
- Svelte: packages/svelte/src/components/Button/DsButton.svelte
- Test: packages/react/src/components/Button/Button.test.tsx
- HTML: packages/html/examples/button.html

Report issues as: [PASS] or [FAIL] with file path, line number, and fix recommendation.
```

---

## Token QA

```
Run a QA check on design tokens after changes to [describe what changed].

Step 1 — Build:
pnpm --filter @vcds/tokens build
Verify no errors in the console output.

Step 2 — Theme completeness:
For each token added or modified, verify it exists in all three:
- packages/tokens/src/semantic/light.json
- packages/tokens/src/semantic/dark.json
- packages/tokens/src/semantic/high-contrast.json
Color tokens MUST appear in all three themes.

Step 3 — Reference integrity:
Check every {reference.path} value in the modified files resolves to a primitive
in packages/tokens/src/primitives/. Flag any broken or circular references.

Step 4 — Naming:
Verify all token names use kebab-case: {category}-{property}-{element}-{variant}-{state}
No camelCase, PascalCase, or underscores.

Step 5 — Generated output:
Inspect these files for correctness:
- packages/tokens/platforms/web/tokens.css (CSS vars with --{prefix}-)
- packages/tokens/platforms/web/tokens-dark.css ([data-theme="dark"] selector)
- packages/tokens/platforms/web/tokens-high-contrast.css
- packages/tokens/platforms/web/_tokens.scss
- packages/tokens/platforms/web/tokens.js and tokens.d.ts

Step 6 — Contrast:
For any color tokens, verify WCAG 2.2 AA contrast ratios:
- Text on background: 4.5:1 minimum
- UI elements on background: 3:1 minimum
- Check all three themes (light, dark, high-contrast)

Resolve primitive values from packages/tokens/src/primitives/color.json to get
actual hex values for comparison.

Report: [PASS] or [FAIL] per step with details.
```

---

## Build QA (Quick)

```
Run a full build and test cycle to verify nothing is broken.

1. Full build (order matters):
   pnpm build
   Verify: tokens built, css-components compiled, CSS generated, all framework packages built.

2. All tests:
   pnpm test
   Verify: 0 failures.

3. Lint:
   pnpm lint
   Verify: 0 errors across all packages.

Report: total pass/fail count and list any failures with file paths.
```

---

## Visual QA (Playwright MCP)

```
Use Playwright MCP to visually verify the [ComponentName] component in Storybook.

Prerequisites:
- Start Storybook: pnpm dev (runs on localhost:6006)
- Playwright MCP must be available (configured in .mcp.json)

Step 1 — Navigate:
Open http://localhost:6006/?path=/story/components-[component-name]--[variant]
for each story variant (e.g., --primary, --secondary, --ghost, --danger).

Step 2 — Accessibility snapshot:
Take an accessibility snapshot of each story. Verify:
- Correct element roles (button, link, textbox, etc.)
- Accessible names match expected labels
- States are exposed (disabled, expanded, checked, etc.)
- No unnamed interactive elements

Step 3 — Keyboard navigation:
- Tab through all interactive elements
- Verify focus moves in logical order
- Verify Enter/Space activates the component
- Verify Escape dismisses (if applicable)
- Verify focus indicators are visible

Step 4 — Theme verification:
Navigate with theme globals:
- http://localhost:6006/?path=/story/components-[component-name]--primary&globals=theme:dark
- http://localhost:6006/?path=/story/components-[component-name]--primary&globals=theme:high-contrast
Take accessibility snapshots and verify elements still render correctly.

Step 5 — Element inspection:
For each variant, verify the rendered DOM contains:
- Root element with class .{prefix}-[component-name]
- Variant modifier class .{prefix}-[component-name]--[variant]
- Size modifier class .{prefix}-[component-name]--[size]
- No inline styles for visual appearance

Report: rendered element tree for each variant, noting any issues.
```

---

## Accessibility QA

```
Run an accessibility audit on the [ComponentName] component.

Step 1 — Automated (axe-core):
Verify the test file for each framework includes axe-core assertions:
- packages/react/src/components/[ComponentName]/[ComponentName].test.tsx
- packages/vue/src/components/[ComponentName]/ (test file)
- packages/svelte/src/components/[ComponentName]/ (test file)

Run: pnpm test
Confirm all axe-core assertions pass with 0 violations.

Step 2 — Checklist:
Review against a11y/checklists/component.md. Check every item:
- Semantic HTML (correct element, not div-with-onclick)
- ARIA attributes (roles, labels, expanded, controls, disabled, busy, live)
- Keyboard (Tab, Enter, Space, Escape, Arrow keys as applicable)
- Focus (visible indicator using --{prefix}-focus-ring, no traps, logical order)
- Color (4.5:1 text contrast, 3:1 UI contrast, not sole state indicator)
- Content (alt text, aria-hidden on decorative icons, descriptive errors)
- Motion (prefers-reduced-motion respected)
- Touch (44x44 minimum target size)

Step 3 — Cross-theme:
Verify the component works in all three themes:
- data-theme="light"
- data-theme="dark"
- data-theme="high-contrast"

Step 4 — Cross-framework:
Verify ARIA behavior is identical across React, Vue, and Svelte implementations.

Report each item as: [PASS], [FAIL] with WCAG criterion, or [N/A] with justification.
```

---

## SCSS-Only QA (Quick)

```
Quick QA check on the SCSS for [ComponentName] only (no framework wrappers).

1. pnpm --filter @vcds/css-components build — compiles without errors
2. pnpm --filter @vcds/css-components lint — passes stylelint
3. Read packages/css-components/src/components/_[component-name].scss
4. Check: @use '../config' as cfg; present
5. Check: All selectors use .#{cfg.$prefix}-[component-name] pattern
6. Check: No hardcoded colors (grep for #, rgb(, rgba()
7. Check: No hardcoded spacing (grep for raw px values that should be tokens)
8. Check: All values use var(--#{cfg.$prefix}-*) semantic tokens
9. Check: No primitive token references (e.g., var(--#{cfg.$prefix}-blue-500) is wrong)
10. Check: Focus styles use var(--#{cfg.$prefix}-focus-ring)
11. Check: Registered in packages/css-components/src/index.scss

Reference: packages/css-components/src/components/_button.scss
```

---

## Cross-Framework Parity QA

```
Verify cross-framework parity for [ComponentName].

Read all three implementations:
- packages/react/src/components/[ComponentName]/[ComponentName].tsx
- packages/vue/src/components/[ComponentName]/Ds[ComponentName].vue
- packages/svelte/src/components/[ComponentName]/Ds[ComponentName].svelte

Check the following are identical across all three:

1. Props:
   | Prop | React | Vue | Svelte | Match? |
   |------|-------|-----|--------|--------|
   | variant | [type/default] | [type/default] | [type/default] | |
   | size | [type/default] | [type/default] | [type/default] | |
   | [other props...] | | | | |

2. BEM class output for each prop combination:
   - Default props -> expected classes
   - Each variant -> expected --variant class
   - Each size -> expected --size class
   - Boolean flags -> expected --flag classes

3. ARIA attributes:
   - disabled -> aria-disabled="true" in all three
   - loading -> aria-busy="true" + aria-disabled="true" in all three

4. Event handling:
   - Click suppressed when disabled in all three
   - Click suppressed when loading in all three

5. Prefix usage:
   - React: imports cls from @vcds/shared/prefix
   - Vue: imports DS_PREFIX from @vcds/shared/prefix
   - Svelte: imports DS_PREFIX from @vcds/shared/prefix
   - None hardcode the prefix string

Report mismatches as: [MISMATCH] framework1 vs framework2, prop/behavior, expected vs actual.
```

---

## Tips for Best Results

1. Always run builds before manual inspection — stale output hides real issues
2. Reference the golden Button component — it is the pattern all components must follow
3. For token QA, resolve primitive references manually to get actual hex values for contrast checks
4. The prefix in `ds.config.json` defaults to `vcds` but could change — always check
5. When checking cross-framework parity, focus on class string output — the contract between SCSS and wrappers
6. Use `pnpm build` (not individual builds) to verify the full dependency chain
7. Use Playwright MCP for rendered output verification — accessibility snapshots are more reliable than screenshots
