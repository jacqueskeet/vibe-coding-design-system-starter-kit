# AGENTS.md — Design System Starter Kit (OpenCode · Antigravity · Codex)

> **Start here:** `docs/ARCHITECTURE.md` contains the full architectural context —
> design principles, layer model, token system, prefix mechanics, Figma integration,
> build chain, and decision log. Read it first for the "why" behind these rules.

## Project Overview

This is a multi-framework design system monorepo. It produces component libraries for React, Vue, Svelte, and Angular — all driven by a shared set of design tokens built with Style Dictionary.

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

## Configurable Prefix

The prefix is defined in `/ds.config.json` (default: `vcds`). It flows to:
- CSS custom properties: `--vcds-color-action-primary`
- BEM classes: `.vcds-button`, `.vcds-button--primary`
- JS constant: `DS_PREFIX` from `@vcds/shared/prefix`

**Change prefix:** `node scripts/set-prefix.js <new-prefix>` then `pnpm build`

**Rules:** Use `cls()` helper in JS frameworks, `#{cfg.$prefix}` in SCSS. Never hardcode.

## CSS-First Architecture

This repo uses a **CSS-first base layer** pattern. All visual styles live in `packages/css-components/` as BEM-structured SCSS. Framework packages are thin wrappers that map props to these shared BEM classes.

```
@vcds/tokens              → CSS custom properties (universal)
  └── @vcds/css-components  → BEM classes (web base layer)
        ├── @vcds/react     → Props → class names + interactivity
        ├── @vcds/vue       → Props → class names + interactivity
        ├── @vcds/svelte    → Props → class names + interactivity
        ├── @vcds/angular   → Props → class names + interactivity
        └── @vcds/html      → Use classes directly
```

**Rules:**
- ALL component visual styles go in `packages/css-components/src/components/`
- Framework components (React/Vue/Svelte/Angular) MUST NOT define their own styles
- Framework components use BEM class strings: `ds-button`, `vcds-button--primary`
- HTML package provides copy-paste reference markup

## Key Commands

```bash
pnpm install                             # Install all dependencies
pnpm --filter @vcds/tokens build           # Build tokens to all platforms
pnpm --filter @vcds/css-components build   # Build shared component CSS
pnpm --filter @vcds/css build              # Generate CSS from tokens
pnpm --filter @vcds/react build            # Build React component library
pnpm --filter @vcds/vue build              # Build Vue component library
pnpm --filter @vcds/svelte build           # Build Svelte component library
pnpm --filter @vcds/angular build          # Build Angular component library
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

## Component Conventions

### Creating a New Component — ALWAYS follow this order:

1. **SCSS first** → `packages/css-components/src/components/_component-name.scss`
2. **Register** → Add `@use 'components/component-name';` to index.scss
3. **Build CSS** → `pnpm --filter @vcds/css-components build`
4. **HTML reference** → `packages/html/examples/component-name.html`
5. **Framework wrappers** → React, Vue, Svelte, Angular (apply BEM classes, no styles)
6. **Tests + Stories**

### File Structure

```
packages/css-components/src/components/_button.scss  ← Visual source of truth

packages/html/examples/button.html                   ← HTML reference

packages/react/src/components/Button/
├── Button.tsx           # Maps props to BEM classes
├── Button.test.tsx      # Unit + a11y tests
├── Button.types.ts      # TypeScript interfaces
└── index.ts             # Public exports
```

### BEM Naming

```
.{prefix}-{component}                    → Block    (.vcds-button)
.{prefix}-{component}--{variant}        → Modifier (.vcds-button--primary)
.{prefix}-{component}__{element}        → Element  (.vcds-button__icon-left)
```

### Naming

- Components: PascalCase (`Button`, `TextInput`, `DataTable`)
- Props: camelCase (`isDisabled`, `ariaLabel`, `colorScheme`)
- BEM classes: `ds-` prefix, kebab-case (`vcds-button--primary`, `ds-card__header`)
- Tokens in CSS: `var(--vcds-color-action-primary)`
- Events: `on` prefix in React (`onClick`), `emit` in Vue, `on:` in Svelte, `@Output()` in Angular

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
- Focus indicators must be visible (use `--ds-focus-ring` token)
- Color is never the sole indicator of state
- Check `a11y/checklists/` for component-specific requirements

## Blueprints

Before creating a new component, reference the blueprints:
- `/blueprints/scss/` — SCSS component template (start here — CSS-first)
- `/blueprints/html-css/` — HTML reference page template
- `/blueprints/{react,vue,svelte}/` — Framework wrapper templates

## Prompts and Skills

- `/prompts/` — tested prompts for component generation, token management, a11y audits
- `/skills/` — agent skill files for design, coding, tokens, accessibility

## Working with Tokens

When adding or modifying tokens:
1. Edit the JSON files in `packages/tokens/src/`
2. Run `pnpm --filter @vcds/tokens build`
3. Verify generated output in `packages/tokens/platforms/`
4. Update CSS in `packages/css/` if needed
5. Check that all components still render correctly

## Figma Integration

Three Figma integration paths are pre-configured in `.mcp.json`:

**Figma Console MCP (preferred):** 56+ tools — extract tokens (CSS/Sass/Tailwind/JSON), create components, manage variables, debug plugins. Docs: https://docs.figma-console-mcp.southleft.com/

**Figma Dev Mode MCP (official):** Read-only code generation from designs.

**Figma CLI (Claude Code, OpenCode + Codex only):** Direct binary access to Figma Desktop. See `skills/figma-cli.md`.

> **Codex users:** MCP servers are also configured in `.codex/config.toml` (TOML format). See `guides/figma-setup.md` for Codex-specific setup.

See `docs/ARCHITECTURE.md` Section 10 for the full comparison.

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

## Git Conventions

- Branch: `feat/component-name`, `fix/token-issue`, `docs/guide-update`
- Commits: conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- Always create a changeset (`pnpm changeset`) for any package change
- PR description should list components affected and link to related Figma frames
