# @vcds/css-components

The visual foundation of the design system. All component styles live here as BEM-structured SCSS, compiled to plain CSS. Every framework package (React, Vue, Svelte) imports this as a dependency — they are thin wrappers that map props to these class names.

## Architecture

```
@vcds/tokens              ← CSS custom properties (colors, spacing, typography)
  └── @vcds/css-components  ← BEM classes consuming those properties (THIS PACKAGE)
        ├── @vcds/react     ← Props → class names + interactivity
        ├── @vcds/vue       ← Props → class names + interactivity
        ├── @vcds/svelte    ← Props → class names + interactivity
        └── Plain HTML    ← Use classes directly
```

## Usage

### In framework packages

Framework packages declare `@vcds/css-components` as a dependency and import the compiled CSS:

```tsx
// In a framework package's entry point or layout
import '@vcds/css-components/dist/index.css';
```

### In plain HTML

Link the compiled stylesheet and apply BEM classes:

```html
<link rel="stylesheet" href="node_modules/@vcds/css-components/dist/index.css" />

<button class="vcds-button vcds-button--primary vcds-button--md">
  Save changes
</button>
```

## Naming Convention

All classes follow BEM with a `ds-` prefix:

```
.vcds-{component}                    → Block    (.vcds-button)
.vcds-{component}--{variant}        → Modifier (.vcds-button--primary)
.vcds-{component}--{size}           → Modifier (.vcds-button--lg)
.vcds-{component}__{element}        → Element  (.vcds-button__icon-left)
.vcds-{component}__{element}--{mod} → Element modifier (.vcds-button__label--hidden)
```

## Building

```bash
pnpm --filter @vcds/css-components build
```

This compiles `src/index.scss` → `dist/index.css` (minified) and `dist/index.expanded.css` (readable).

## Adding a New Component

1. Create `src/components/_component-name.scss`
2. Add `@use 'components/component-name';` to `src/index.scss`
3. Follow BEM naming: `.vcds-component-name`, `.vcds-component-name--variant`
4. Use ONLY token CSS custom properties — no hardcoded values
5. Build: `pnpm --filter @vcds/css-components build`

## Token Usage

All values must come from `@vcds/tokens` CSS custom properties:

```scss
// ✅ Correct — uses semantic token
.vcds-card {
  background-color: var(--vcds-color-surface-primary);
  padding: var(--vcds-spacing-lg);
  border-radius: var(--vcds-radius-md);
}

// ❌ Wrong — hardcoded values
.vcds-card {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
}
```
