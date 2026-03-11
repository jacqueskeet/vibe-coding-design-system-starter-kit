# Prompt: Generate a New Component

Use these prompts to generate new components following the metadata-first, CSS-first architecture.

---

## Basic Component Generation

```
Create a new [ComponentName] component for this design system.

IMPORTANT: Follow the metadata-first, CSS-first architecture. Start with metadata, then SCSS, then HTML, then frameworks.

Step 0 — Component metadata (machine-readable):
- Create packages/css-components/src/components/[component-name].meta.json
- Follow the blueprint in /blueprints/scss/Component.meta.blueprint.json
- Reference the golden Button: packages/css-components/src/components/button.meta.json
- Define: intent (purpose + task_context), composition (requires/allows/forbids),
  variant logic (use_when/avoid_when for each), relationships (related/escalates/degrades),
  and accessibility (role, keyboard, WAI-ARIA pattern)
- Validate: pnpm validate:metadata

Step 1 — SCSS (visual source of truth):
- Create packages/css-components/src/components/_[component-name].scss
- Follow the BEM blueprint in /blueprints/scss/Component.blueprint.scss
- Reference the golden Button: packages/css-components/src/components/_button.scss
- Use ONLY semantic design tokens via var(--vcds-*) CSS custom properties
- BEM naming: .{prefix}-[component-name], .{prefix}-[component-name]--variant
- Include variants: [list variants]
- Include sizes: sm, md, lg
- Register in packages/css-components/src/index.scss

Step 2 — HTML reference:
- Create packages/html/examples/[component-name].html
- Follow the blueprint in /blueprints/html-css/Component.blueprint.html
- Show all variants, sizes, states, and accessibility patterns

Step 3 — Framework wrappers (thin — NO styles):
- Create React, Vue, and Svelte wrappers
- Follow blueprints in /blueprints/{react,vue,svelte}/
- Map props to BEM class strings — NO CSS Modules, NO <style> blocks
- Include TypeScript types, ARIA attributes, keyboard handling

Step 4 — Tests and docs:
- Unit tests with axe-core a11y assertions
- Storybook stories showing all variants and states
- Reference /a11y/checklists/component.md

File locations:
- Metadata: packages/css-components/src/components/[component-name].meta.json
- SCSS: packages/css-components/src/components/_[component-name].scss
- HTML: packages/html/examples/[component-name].html
- React: packages/react/src/components/[ComponentName]/
- Vue: packages/vue/src/components/[ComponentName]/
- Svelte: packages/svelte/src/components/[ComponentName]/
- Stories: packages/docs/stories/[ComponentName].stories.tsx
```

---

## Add Metadata to Existing Component

```
Add machine-readable metadata to the existing [ComponentName] component.

Step 1 — Read the existing implementation:
- Read packages/css-components/src/components/_[component-name].scss
- Read one framework wrapper (e.g., React) to understand props and behavior
- Read any existing tests or stories for accessibility patterns

Step 2 — Create metadata file:
- Create packages/css-components/src/components/[component-name].meta.json
- Follow the blueprint in /blueprints/scss/Component.meta.blueprint.json
- Reference the golden Button: packages/css-components/src/components/button.meta.json

Step 3 — Fill in all 7 sections:
- intent: purpose, task_context, sentiment
- composition: requires, allows, forbids
- variants: use_when, avoid_when, pair_with for each BEM --variant in the SCSS
- context: density, modality, mode
- relationships: related, escalates_to, degrades_to, groups_with
- observability: track events, health metrics
- accessibility: role, wai_aria_pattern link, keyboard map, announces

Step 4 — Validate:
- Run: pnpm validate:metadata
- Verify variant names match BEM modifiers in the SCSS
- Verify accessibility.role matches the rendered HTML element

Step 5 — Update the Storybook story:
- Import the metadata in the component's story file
- Add parameters.componentMetadata to the story meta
```

---

## HTML/CSS Only (No Framework)

```
Create a [ComponentName] component for HTML/CSS use (no JavaScript framework).

Step 1 — SCSS:
- Create packages/css-components/src/components/_[component-name].scss
- BEM naming, semantic tokens only
- Include variants: [list variants]
- Register in index.scss

Step 2 — HTML reference:
- Create packages/html/examples/[component-name].html
- Show all variants, sizes, states
- Include accessibility markup (ARIA attributes)
- Include copy-paste ready code snippets

I do NOT need React, Vue, or Svelte wrappers for this component.
```

---

## Component with Specific Behavior

```
Create a [ComponentName] component with the following behavior:

[Describe the interactive behavior, states, and user flows]

Start with SCSS in packages/css-components/ following the CSS-first architecture.
Then create HTML reference and framework wrappers.

Additional requirements:
- Support controlled and uncontrolled usage patterns
- Handle keyboard navigation: [describe expected keyboard behavior]
- Manage focus: [describe focus management needs]
- Announce state changes to screen readers via aria-live or role changes
- Follow the WAI-ARIA [pattern name] pattern: [link to WAI-ARIA APG]
```

---

## Compound Component

```
Create a compound [ComponentName] component with these sub-components:
- [ComponentName].Root — container wrapper
- [ComponentName].Header — header section
- [ComponentName].Body — main content area
- [ComponentName].Footer — action area

Start with SCSS — all sub-components share one SCSS file:
packages/css-components/src/components/_[component-name].scss

BEM structure:
- .{prefix}-[component-name] (root)
- .{prefix}-[component-name]__header
- .{prefix}-[component-name]__body
- .{prefix}-[component-name]__footer

Then create HTML reference showing the full compound markup,
followed by React (Context), Vue (provide/inject), and Svelte (context) wrappers.
```

---

## Tips for Best Results

1. Always say "metadata-first, CSS-first" — this reminds the agent to start with `.meta.json`, then SCSS
2. Reference the metadata blueprint — `/blueprints/scss/Component.meta.blueprint.json`
3. Reference the SCSS blueprint — `/blueprints/scss/Component.blueprint.scss`
4. Reference the golden Button — `_button.scss` + `button.meta.json` in `packages/css-components/src/components/`
5. Include the a11y checklist reference — this catches most accessibility gaps
6. Mention the frameworks explicitly if you want all three, or say "HTML/CSS only"
7. For HTML-only teams, say you don't need framework wrappers — this saves time
8. For existing components, use the "Add Metadata to Existing Component" prompt to retrofit
