# Contributing to the Design System

This guide is written for both **human contributors** and **AI agents**. Follow these standards to maintain consistency across the system.

---

## Getting Started

```bash
git clone https://github.com/your-org/design-system-starter.git
cd design-system-starter
pnpm install
pnpm build:tokens
pnpm build:css
pnpm dev
```

## Architecture

This project uses a **CSS-first base layer**. All visual styles live in `packages/css-components/` as BEM SCSS. Framework packages (React, Vue, Svelte) are thin wrappers that map props to BEM class names. The HTML package provides reference markup for use without a framework.

```
@ds/tokens → @ds/css-components → @ds/react / @ds/vue / @ds/svelte / @ds/html
```

## Branching

```
feat/component-name     # New component or feature
fix/issue-description   # Bug fix
docs/what-changed       # Documentation update
chore/tooling-change    # Build, CI, or dependency update
```

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(css-components): add Badge component SCSS
feat(react): add Badge wrapper
fix(tokens): correct dark theme surface color
docs: update Figma setup guide
```

## Creating a Component — CSS-First Order

### Step 1: SCSS (visual source of truth)

1. Reference the blueprint: `blueprints/scss/Component.blueprint.scss`
2. Reference the golden Button: `packages/css-components/src/components/_button.scss`
3. Create: `packages/css-components/src/components/_component-name.scss`
4. Register: add `@use 'components/component-name';` to `src/index.scss`
5. Build: `pnpm --filter @ds/css-components build`

### Step 2: HTML reference

1. Reference the blueprint: `blueprints/html-css/Component.blueprint.html`
2. Create: `packages/html/examples/component-name.html`
3. Show all variants, sizes, states, and a11y patterns

### Step 3: Framework wrappers (thin — NO styles)

1. Reference the blueprint: `blueprints/{react,vue,svelte}/`
2. Create wrappers that map props to BEM class strings
3. **NO CSS Modules, NO scoped styles, NO `<style>` blocks**
4. Include TypeScript types, ARIA attributes, keyboard handling

### Step 4: Tests and documentation

1. Unit tests with axe-core accessibility assertions
2. Storybook stories covering all variants and states
3. Pass the a11y checklist: `a11y/checklists/component.md`
4. Create a changeset: `pnpm changeset`

### File structure:

```
packages/css-components/src/components/_button.scss   ← Visual source of truth
packages/html/examples/button.html                    ← HTML reference

packages/react/src/components/Button/
├── Button.tsx           # Maps props → BEM classes (NO style imports)
├── Button.types.ts      # TypeScript interfaces
├── Button.test.tsx      # Unit + a11y tests
└── index.ts             # Public exports
```

Vue (`.vue`, no `<style>`) and Svelte (`.svelte`, no `<style>`) follow the same pattern.

## Design Token Changes

1. Edit JSON files in `packages/tokens/src/`
2. Add values for ALL THREE themes: light, dark, high-contrast
3. Run `pnpm --filter @ds/tokens build`
4. Verify output in `packages/tokens/platforms/`
5. Rebuild CSS: `pnpm --filter @ds/css-components build`
6. Create a changeset: `pnpm changeset`

## Pull Request Checklist

- [ ] SCSS exists in `packages/css-components/` with BEM naming
- [ ] HTML reference page in `packages/html/examples/`
- [ ] Framework wrappers in React, Vue, AND Svelte (no styles in wrappers)
- [ ] All tokens are semantic (no hardcoded values, no primitive references)
- [ ] Tests pass (`pnpm test`)
- [ ] Lint passes (`pnpm lint`)
- [ ] axe-core reports 0 violations
- [ ] Storybook stories cover all variants and states
- [ ] a11y checklist reviewed (`a11y/checklists/component.md`)
- [ ] Changeset created (`pnpm changeset`)
- [ ] PR description includes:
  - What the change does
  - Screenshots of the component (if visual)
  - Related Figma frame link (if applicable)
  - Accessibility considerations

## For AI Agents

When generating code for this repository:

1. Always start with SCSS in `packages/css-components/` — CSS-first
2. Read the relevant blueprint before creating files
3. Use the golden Button SCSS as your pattern reference
4. Framework wrappers are thin — props to BEM classes, no styles
5. Never skip accessibility — every component needs ARIA, keyboard, and focus handling
6. Use the prompt library in `prompts/` for structured generation tasks
7. Run `pnpm build` after generating to verify the build chain works
