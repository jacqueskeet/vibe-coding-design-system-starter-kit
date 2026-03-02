# CLAUDE.md — Design System Starter Kit

> **Start here:** `docs/ARCHITECTURE.md` contains the full architectural context —
> design principles, layer model, token system, prefix mechanics, Figma integration,
> build chain, and decision log. Read it first for the "why" behind these rules.

## Project Overview

This is a multi-framework design system monorepo. It produces component libraries for React, Vue, and Svelte — all driven by a shared set of design tokens built with Style Dictionary.

## Tech Stack

- **Package manager**: pnpm (workspace protocol)
- **Monorepo**: pnpm workspaces
- **Tokens**: Style Dictionary v4 → CSS vars, SCSS, JS/TS, Swift, Kotlin, XML
- **React**: TypeScript, CSS Modules consuming token CSS vars
- **Vue**: Vue 3 Composition API + SFC, TypeScript, CSS vars
- **Svelte**: Svelte 5, TypeScript, CSS vars
- **Docs**: Storybook 8
- **Testing**: Vitest (unit), axe-core (a11y), Playwright (visual regression)
- **CI**: GitHub Actions
- **Versioning**: Changesets

## Key Commands

```bash
pnpm install                             # Install all dependencies
pnpm --filter @vcds/tokens build           # Build tokens to all platforms
pnpm --filter @vcds/css-components build   # Build shared component CSS
pnpm --filter @vcds/css build              # Build global CSS from tokens
pnpm --filter @vcds/react build            # Build React component library
pnpm --filter @vcds/vue build              # Build Vue component library
pnpm --filter @vcds/svelte build           # Build Svelte component library
pnpm --filter @vcds/docs dev               # Start Storybook dev server
pnpm build                               # Build everything (tokens → CSS → frameworks)
pnpm test                                # Run all tests
pnpm lint                                # Lint all packages
pnpm changeset                           # Create a changeset for versioning
```

**Build order matters:** tokens → css-components → framework packages

## Design Token Architecture

Tokens use a three-tier hierarchy. ALWAYS follow this pattern:

```
PRIMITIVE (raw values)  →  SEMANTIC (intent)         →  COMPONENT (usage)
blue-500                →  color-action-primary       →  button-bg-default
gray-100                →  color-surface-secondary     →  card-bg
space-4                 →  spacing-md                  →  input-padding-x
```

Token files live in `packages/tokens/src/`:
- `primitives/` — raw color, spacing, typography, elevation values
- `semantic/` — theme-aware mappings (light.json, dark.json, high-contrast.json)

**Rules:**
- Components MUST only use semantic or component-level tokens, never primitives directly
- All colors must pass WCAG 2.2 AA contrast ratios (4.5:1 for text, 3:1 for UI)
- Token names use kebab-case: `color-action-primary`, not `colorActionPrimary`

## Configurable Prefix

The design system prefix is defined in `/ds.config.json` and defaults to `vcds`.
It flows through every layer automatically:

```
ds.config.json  →  Style Dictionary tokens  (--vcds-color-*, --vcds-spacing-*)
                →  SCSS _config.scss         (.vcds-button, .vcvcds-button--primary)
                →  JS/TS @vcds/shared          (DS_PREFIX = 'vcds', cls() helper)
```

**Change prefix:** `node scripts/set-prefix.js <new-prefix>` then `pnpm build`

**Where the prefix appears:**
- CSS custom properties: `--vcds-color-action-primary`
- BEM class names: `.vcds-button`, `.vcvcds-button--primary`
- Sub-elements: `.vcvcds-button__icon-left`
- Animations: `@keyframes vcds-button-spin`

**Rules for agents:**
- ALWAYS use the `cls()` helper from `@vcds/shared/prefix` in framework components
- NEVER hardcode the prefix string in framework wrappers
- In SCSS, use `#{cfg.$prefix}` interpolation (import `_config.scss` as `cfg`)
- HTML reference pages use the literal prefix — update when prefix changes

## CSS-First Architecture

This repo uses a **CSS-first base layer** pattern. All visual styles live in `packages/css-components/` as BEM-structured SCSS. Framework packages are thin wrappers that map props to these shared BEM classes.

```
@vcds/tokens              → CSS custom properties (universal)
  └── @vcds/css-components  → BEM classes (web base layer)
        ├── @vcds/react     → Props → class names + interactivity
        ├── @vcds/vue       → Props → class names + interactivity
        ├── @vcds/svelte    → Props → class names + interactivity
        └── @vcds/html      → Use classes directly
```

**Rules:**
- ALL component visual styles go in `packages/css-components/src/components/`
- Framework components (React/Vue/Svelte) MUST NOT define their own styles
- Framework components use BEM class strings: `ds-button`, `vcds-button--primary`
- HTML package provides copy-paste reference markup

## Component Conventions

### Creating a New Component — ALWAYS follow this order:

1. **SCSS first** → Create `packages/css-components/src/components/_component-name.scss`
2. **Register** → Add `@use 'components/component-name';` to `packages/css-components/src/index.scss`
3. **Build CSS** → `pnpm --filter @vcds/css-components build`
4. **HTML reference** → Create `packages/html/examples/component-name.html`
5. **Framework wrappers** → Create thin React, Vue, Svelte wrappers that apply BEM classes
6. **Tests** → Unit + axe-core for each framework wrapper
7. **Stories** → Storybook stories

### File Structure (per component)

```
packages/css-components/src/components/_button.scss  ← Visual source of truth

packages/html/examples/button.html                   ← HTML reference

packages/react/src/components/Button/
├── Button.tsx           # Maps props to BEM classes
├── Button.test.tsx      # Unit + a11y tests
├── Button.types.ts      # TypeScript interfaces
└── index.ts             # Public exports
```

Vue uses `.vue` SFCs, Svelte uses `.svelte` — equivalent structure, no `<style>` blocks.

### BEM Naming Convention

```
.{prefix}-{component}                    → Block    (.vcds-button)
.{prefix}-{component}--{variant}        → Modifier (.vcvcds-button--primary)
.{prefix}-{component}--{size}           → Modifier (.vcvcds-button--lg)
.{prefix}-{component}__{element}        → Element  (.vcvcds-button__icon-left)
.{prefix}-{component}__{element}--{mod} → Element  (.vcvcds-button__label--hidden)
```

Where `{prefix}` comes from `ds.config.json` (default: `vcds`).

### Naming
- Components: PascalCase (`Button`, `TextInput`, `DataTable`)
- Props: camelCase (`isDisabled`, `ariaLabel`, `colorScheme`)
- BEM classes: `ds-` prefix, kebab-case (`vcds-button--primary`, `vcds-card__header`)
- Tokens in CSS: `var(--vcds-color-action-primary)`
- Events: `on` prefix in React (`onClick`), `emit` in Vue, `on:` in Svelte

### Required for Every Component
1. **SCSS in css-components** — BEM-structured, using only semantic tokens
2. **HTML reference** — copy-paste example in `packages/html/examples/`
3. **TypeScript types** — exported interface for all props
4. **Default props** — sensible defaults for optional props
5. **Accessibility** — ARIA attributes, keyboard handling, focus management
6. **Stories** — Storybook story covering all variants and states
7. **Tests** — unit tests + axe-core a11y checks

## Accessibility Standards

- Target: **WCAG 2.2 AA**
- All interactive elements must be keyboard accessible
- All images/icons need alt text or `aria-hidden="true"`
- Focus indicators must be visible (use `--vcds-focus-ring` token)
- Color is never the sole indicator of state
- Check `a11y/checklists/` for component-specific requirements

## Blueprints

Before creating a new component, reference the blueprints:
- `/blueprints/scss/` — SCSS component template (start here — CSS-first)
- `/blueprints/html-css/` — HTML reference page template
- `/blueprints/{react,vue,svelte}/` — Framework wrapper templates

## Prompts

The `/prompts/` directory contains tested, reusable prompts for common tasks. Reference these when you need to generate components, manage tokens, or perform audits.

## Working with Tokens

When adding or modifying tokens:
1. Edit the JSON files in `packages/tokens/src/`
2. Run `pnpm --filter @vcds/tokens build`
3. Verify generated output in `packages/tokens/platforms/`
4. Update CSS in `packages/css/` if needed
5. Check that all components still render correctly

## Git Conventions

- Branch: `feat/component-name`, `fix/token-issue`, `docs/guide-update`
- Commits: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Always create a changeset (`pnpm changeset`) for any package change
- PR description should list components affected and link to related Figma frames

## Figma Integration

This repo supports three Figma integration paths (pre-configured in `.mcp.json`):

**Figma Console MCP (preferred):** 56+ tools for full design system workflows — extract tokens as CSS/Sass/Tailwind/JSON, create components programmatically, manage variables, debug plugins, capture screenshots. Works across all MCP-compatible IDEs. Requires Desktop Bridge Plugin in Figma Desktop for full capabilities.
- Docs: https://docs.figma-console-mcp.southleft.com/
- Key tools: `figma_get_variables`, `figma_get_component`, `figma_execute`, `figma_get_design_system_summary`

**Figma Dev Mode MCP (official):** Read-only code generation from Figma designs. Good for quick component spec extraction but cannot export tokens or create/modify designs.

**Figma CLI (Claude Code + OpenCode only):** Direct binary access to Figma Desktop for terminal-based read/write workflows. Requires setup via `scripts/setup-figma-cli.js`. See `skills/figma-cli.md`.

See `guides/figma-setup.md` for setup options and `docs/ARCHITECTURE.md` Section 10 for the full comparison.

## Decision Capture

This project uses `DECISIONS.md` to record project-specific decisions that apply across all future work. Read it before starting any task — every documented decision should be reflected in your output.

**When to nudge the user to document a decision:**
- After creating the first component that establishes a new pattern (e.g., variant naming, prop conventions)
- After defining a new token category or scale (e.g., color palette, spacing ramp, typography)
- After resolving an ambiguous design choice with the user (e.g., "always use ghost buttons for secondary actions")
- After the user states a preference that should apply system-wide (e.g., "icons should always be 20px")
- After establishing an accessibility pattern beyond WCAG minimums (e.g., "all modals must announce their title")
- After choosing animation, motion, or responsive breakpoint conventions

**How to nudge:**
After completing the task, suggest:
> "This decision could affect future components. Want me to add it to `DECISIONS.md` so it's applied consistently going forward?"

If the user agrees, append the decision using the format in `DECISIONS.md` (Decision, Context, Applies to).

## Related Agent Config Files

This repo includes agent rules for multiple IDEs. The content is kept consistent across all files:
- `docs/ARCHITECTURE.md` — Deep-context document: design principles, architecture rationale, decision log (read first)
- `CLAUDE.md` — Claude Code (this file)
- `AGENTS.md` — OpenCode (also read by Google Antigravity)
- `.cursor/rules/` — Cursor (3 rule files)
- `.windsurfrules` — Windsurf
- `.antigravity/rules.md` — Google Antigravity
- `.github/copilot-instructions.md` — GitHub Copilot
