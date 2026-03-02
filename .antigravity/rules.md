# Design System Starter Kit — Agent Rules

> **Start here:** `docs/ARCHITECTURE.md` contains the full architectural context —
> design principles, layer model, token system, prefix mechanics, Figma integration,
> build chain, and decision log. Read it first for the "why" behind these rules.

You are working in a multi-framework design system monorepo producing component libraries for React, Vue, and Svelte, driven by shared design tokens built with Style Dictionary.

## Tech Stack

- Package manager: pnpm (workspace protocol)
- Tokens: Style Dictionary v4 → CSS vars, SCSS, JS/TS, Swift, Kotlin, XML
- React: TypeScript, CSS Modules consuming token CSS vars
- Vue: Vue 3 Composition API + SFC, TypeScript, CSS vars
- Svelte: Svelte 5, TypeScript, CSS vars
- Docs: Storybook 8
- Testing: Vitest (unit), axe-core (a11y), Playwright (visual regression)
- CI: GitHub Actions with Changesets versioning

## Token Architecture — CRITICAL

Tokens follow a three-tier hierarchy. ALWAYS respect this:

```
PRIMITIVE (raw values)  →  SEMANTIC (intent)         →  COMPONENT (usage)
blue-500                →  color-action-primary       →  button-bg-default
gray-100                →  color-surface-secondary     →  card-bg
space-4                 →  spacing-md                  →  input-padding-x
```

- Token source: `packages/tokens/src/` (primitives/ and semantic/)
- Components MUST only use semantic or component-level tokens
- NEVER use hardcoded colors, spacing, or typography values
- In CSS: `var(--vcds-color-action-primary)`, `var(--vcds-spacing-md)`
- Token names use kebab-case
- All colors must pass WCAG 2.2 AA contrast ratios (4.5:1 text, 3:1 UI)

## CSS-First Architecture

**Prefix:** Configurable via `/ds.config.json` (default: `vcds`). Change with `node scripts/set-prefix.js <new-prefix>`.

All visual styles live in `packages/css-components/` as BEM-structured SCSS. Framework packages are thin wrappers — they map props to BEM classes and add interactivity. They MUST NOT define their own styles.

```
@vcds/tokens → @vcds/css-components → @vcds/react / @vcds/vue / @vcds/svelte / @vcds/html
```

### Creating a New Component — ALWAYS follow this order:

1. SCSS first → `packages/css-components/src/components/_name.scss`
2. Register → Add `@use 'components/name';` to index.scss
3. Build CSS → `pnpm --filter @vcds/css-components build`
4. HTML reference → `packages/html/examples/name.html`
5. Framework wrappers → React, Vue, Svelte (BEM classes, no styles)
6. Tests + Stories

### BEM Naming

```
.{prefix}-{component}                    → Block    (.vcds-button)
.{prefix}-{component}--{variant}        → Modifier (.vcds-button--primary)
.{prefix}-{component}__{element}        → Element  (.vcds-button__icon-left)
```

## Component Conventions

### File Structure (per component)

```
packages/css-components/src/components/_button.scss  ← Visual source of truth
packages/html/examples/button.html                   ← HTML reference

packages/react/src/components/Button/
├── Button.tsx           # Maps props to BEM classes
├── Button.test.tsx      # Unit + a11y tests
├── Button.types.ts      # TypeScript interfaces
├── index.ts             # Public exports
```

Vue uses `.vue` SFCs, Svelte uses `.svelte` — no `<style>` blocks.

### Every Component Requires

1. TypeScript types — exported interface for all props
2. Sensible default props
3. ARIA attributes, keyboard handling, focus management
4. Semantic tokens only — no hardcoded values
5. Storybook stories covering all variants and states
6. Unit tests with axe-core a11y checks

### Naming

- Components: PascalCase (`Button`, `TextInput`)
- Props: camelCase (`isDisabled`, `ariaLabel`)
- CSS classes: kebab-case via CSS Modules
- CSS token usage: `var(--vcds-{category}-{name})`

## Key Commands

```bash
pnpm install                             # Install all dependencies
pnpm --filter @vcds/tokens build           # Build tokens to all platforms
pnpm --filter @vcds/css-components build   # Build shared component CSS
pnpm --filter @vcds/docs dev               # Start Storybook dev server
pnpm build                               # Build everything (tokens → CSS → frameworks)
pnpm test                                # Run all tests
pnpm changeset                           # Create a changeset for versioning
```

**Build order matters:** tokens → css-components → framework packages

## Before Creating a Component

1. Read the SCSS blueprint in `/blueprints/scss/`
2. Read the framework blueprint in `/blueprints/{react,vue,svelte}/`
3. Check `/a11y/checklists/component.md`
4. Reference the golden Button in `packages/css-components/src/components/_button.scss`
5. Use semantic tokens from `packages/tokens/src/semantic/`
6. Start with SCSS, then HTML reference, then framework wrappers

## Figma Integration

This repo supports Figma MCP servers (pre-configured in `.mcp.json`). Share a Figma URL and the agent can inspect components, extract token values, and generate code from designs.

## Prompts and Skills

- `/prompts/` — tested prompts for component generation, token management, a11y audits
- `/skills/` — agent skill files for design, coding, tokens, accessibility
- `/blueprints/` — skeleton templates for each framework

## Decision Capture

Read `DECISIONS.md` before starting any task. Apply every documented decision to your output. After completing a task that established a new repeatable pattern (variant naming, token scale, accessibility convention, etc.), suggest the user document it in `DECISIONS.md` so it's applied consistently going forward.

## Git Conventions

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Always create a changeset for package changes
- Branch naming: `feat/component-name`, `fix/token-issue`
