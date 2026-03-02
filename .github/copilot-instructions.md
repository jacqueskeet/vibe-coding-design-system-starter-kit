# Copilot Instructions — Design System Starter Kit

> **Start here:** `docs/ARCHITECTURE.md` contains the full architectural context —
> design principles, layer model, token system, prefix mechanics, Figma integration,
> build chain, and decision log. Read it first for the "why" behind these rules.

## Context

Multi-framework design system monorepo with a **CSS-first base layer**. All visual styles live in `packages/css-components/` as BEM SCSS. React, Vue, and Svelte packages are thin wrappers that map props to BEM class names. HTML/CSS teams use the classes directly. Design tokens (Style Dictionary) are the universal foundation.


## Configurable Prefix

All class names and CSS variables use a configurable prefix (default: `vcds`). Defined in `/ds.config.json`. Change: `node scripts/set-prefix.js <prefix>`. Use `cls()` from `@ds/shared/prefix` in JS — never hardcode the prefix.

## Architecture

```
@ds/tokens → @ds/css-components → @ds/react / @ds/vue / @ds/svelte / @ds/html
```

## Code Generation Rules

### Always

- Use `var(--vcds-*)` CSS custom properties for ALL visual values in SCSS
- Follow BEM naming: `.{prefix}-{component}`, `.{prefix}-{component}--{variant}`, `.{prefix}-{component}__{element}`
- Start with SCSS in `packages/css-components/` — this is the visual source of truth
- Include TypeScript types for all component props
- Add ARIA attributes and keyboard event handlers to interactive elements
- Use semantic token names (e.g., `color-action-primary`), not primitives (e.g., `blue-500`)
- Follow the golden Button component in `packages/css-components/src/components/_button.scss`

### Never

- Put visual styles in framework components — NO CSS Modules, NO scoped styles, NO `<style>` blocks
- Hardcode color hex values, pixel spacing, or font sizes
- Skip accessibility attributes
- Use `any` type in TypeScript
- Create a component in only one framework — always create SCSS, HTML reference, then all framework wrappers

### React

- Use `forwardRef` for all components
- Map props to BEM class strings: `'vcds-button vcds-button--primary'`
- Export types from `ComponentName.types.ts`
- Spread `...rest` props onto the root element

### Vue

- Use `<script setup lang="ts">` pattern
- Prefix component names with `Ds` (e.g., `DsButton`)
- Use array class binding: `:class="['vcds-button', 'vcds-button--primary']"`
- NO `<style>` block — all styles come from @ds/css-components

### Svelte

- Use Svelte 5 runes: `$props()`, `$state()`, `$derived()`
- Use `{@render children?.()}` for slot content
- NO `<style>` block — all styles come from @ds/css-components

## Token Pattern

```
Primitive    →  Semantic              →  Component
blue-500     →  color-action-primary  →  button-bg-default
```

Components only use semantic or component-level tokens.

## Decision Capture

Read `DECISIONS.md` before starting any task. Apply every documented decision to your output. After completing a task that established a new repeatable pattern (variant naming, token scale, accessibility convention, etc.), suggest the user document it in `DECISIONS.md` so it's applied consistently going forward.

## Creating a Component — Order Matters

1. SCSS → `packages/css-components/src/components/_name.scss`
2. Register → `@use 'components/name';` in index.scss
3. HTML → `packages/html/examples/name.html`
4. Wrappers → React, Vue, Svelte (props → BEM classes only)
5. Tests → Vitest + axe-core
6. Stories → Storybook
