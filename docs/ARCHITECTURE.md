# Architecture

> The deep-context document for this project. Read this first.
>
> If you are an AI agent encountering this repo for the first time, this document
> gives you the full picture — what this project is, why every architectural
> decision was made, and how to extend it. The other docs (`CLAUDE.md`,
> `AGENTS.md`, `CONTRIBUTING.md`) give you rules to follow. This document gives
> you the reasoning behind those rules.

---

## Table of Contents

1. [What This Project Is](#1-what-this-project-is)
2. [Who It's For](#2-who-its-for)
3. [Design Principles](#3-design-principles)
4. [Architecture Deep Dive](#4-architecture-deep-dive)
5. [The Token System](#5-the-token-system)
6. [The CSS-First Base Layer](#6-the-css-first-base-layer)
7. [The Configurable Prefix](#7-the-configurable-prefix)
8. [Framework Wrappers](#8-framework-wrappers)
9. [The Agent System](#9-the-agent-system)
10. [The Figma Integration](#10-the-figma-integration)
11. [Build Chain — How Everything Connects](#11-build-chain--how-everything-connects)
12. [How to Extend This System](#12-how-to-extend-this-system)
13. [Decision Log](#13-decision-log)

---

## 1. What This Project Is

This is a **design system starter kit** — a monorepo that provides the foundation
for building production-grade, multi-framework component libraries with AI-assisted
development ("vibe coding").

It is not a component library itself. It is the scaffolding, conventions, tooling,
and golden examples that a team or individual clones and builds upon. Think of it
as a blueprint for the blueprint.

The core idea: you clone this repo, set your prefix, and
immediately have a working foundation with design tokens, a CSS component library,
framework wrappers for React/Vue/Svelte/Angular, Storybook documentation, accessibility
standards, CI/CD pipelines, and — critically — agent configuration files that
teach AI coding assistants how your system works from the first keystroke.

The repo is designed to be opened in any of seven supported AI IDEs. Each IDE
reads its respective config file and understands the full design system context
without being told anything.

---

## 2. Who It's For

### Primary audiences

**Design system teams at organisations** who want to accelerate their DS build
with AI. They clone the repo, configure the prefix, drop in their brand tokens,
and start building components. The agent rules mean new team members (human or AI)
are productive immediately.

**Solo designers/developers** who want a production-grade setup without spending
weeks on infrastructure. The monorepo is pre-wired — tokens, CSS, frameworks,
Storybook, CI/CD, accessibility, versioning.

**Teams using CMSs without JS frameworks** (WordPress, Magento/Page Builder,
static sites, email templates). The `@vcds/html` package and `@vcds/css-components`
give them a complete component library with zero JavaScript dependency.

### Secondary audiences

**Design teams learning AI-assisted development** — the repo serves as a
training environment. The agent rules, prompts, and skills directories provide
structured workflows for learning vibe coding.

**Open source design system maintainers** — the multi-framework architecture
and configurable prefix make it suitable as a starting point for public DS
projects.

---

## 3. Design Principles

These principles guide every decision in the system. When in doubt, refer here.

### 3.1 Tokens are the universal source of truth

Design tokens are the single layer that reaches every platform — web, iOS,
Android, React Native. They are defined once in JSON and compiled to
platform-native formats by Style Dictionary. No visual value in the system
exists outside of a token.

### 3.2 CSS is the web's base layer

For web platforms, CSS is the foundation that all frameworks consume. Visual
styles are defined once in BEM-structured SCSS. Framework packages are thin
wrappers that map props to CSS class names. This eliminates style duplication,
guarantees visual consistency, and allows teams without JS frameworks to use
the full component library.

### 3.3 Frameworks add interactivity, not appearance

React, Vue, Svelte, and Angular packages provide developer experience (typed props,
events, state management, slots/children) and accessibility behaviour (keyboard
handling, ARIA attributes, focus management). They never define visual styles.
If you delete all framework code, the CSS component library still works.

### 3.4 Accessibility is structural, not optional

WCAG 2.2 AA is not a checklist item — it's built into the architecture. Every
component uses semantic HTML, ARIA attributes, keyboard navigation, visible
focus indicators, and sufficient colour contrast. The golden Button component
demonstrates every pattern. Tests include axe-core assertions.

### 3.5 The prefix makes it yours

Every class name and CSS variable uses a configurable prefix. Changing the
prefix is a single command that updates three files and propagates everywhere
on rebuild. No grep-and-replace. No missed references. The system is designed
to be forked and branded.

### 3.6 Agents are first-class users

This repo is built for AI-assisted development. Agent configuration files are
not an afterthought — they are a core part of the architecture. Seven IDEs are
supported with consistent, detailed rules. The rules teach the agent the full
context: architecture, conventions, token hierarchy, BEM naming, accessibility
standards, build order, and component creation workflow.

### 3.7 One golden example teaches everything

Rather than providing dozens of half-baked components, the system provides one
deeply considered golden component (Button) that demonstrates every convention:
token usage, BEM naming, prefix interpolation, all variants/sizes/states,
loading/disabled patterns, icon slots, accessibility, TypeScript types, tests,
and Storybook stories. New components are created by following this example.

---

## 4. Architecture Deep Dive

### The layer model

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 0: ds.config.json                                    │
│  Source of truth for prefix, DS name, metadata              │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: @vcds/tokens                                        │
│  JSON → Style Dictionary → CSS vars, SCSS, JS, Swift, XML  │
│  Universal. Compiles to every platform.                     │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: @vcds/css-components                                │
│  BEM SCSS consuming token CSS vars → compiled CSS           │
│  Web-only. The visual source of truth for all web UI.       │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Framework packages                                │
│  @vcds/react, @vcds/vue, @vcds/svelte, @vcds/angular, @vcds/html           │
│  Thin wrappers. Props → BEM classes. No styles.             │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: @vcds/docs                                          │
│  Storybook 8. Consumes @vcds/react for stories.               │
└─────────────────────────────────────────────────────────────┘
```

### Why this order matters

Each layer depends only on the layers above it. Tokens know nothing about CSS
components. CSS components know nothing about React. This means:

- Changing a token value automatically updates every component on rebuild
- Adding a new framework (e.g., Solid, Web Components) only requires a new Layer 3
  package — no changes to Layers 0–2
- HTML/CSS teams can use Layers 0–2 directly and skip Layer 3 entirely
- Mobile platforms (iOS, Android, React Native) use Layer 1 directly and skip
  Layers 2–3 entirely

### Package dependency graph

```
ds.config.json (prefix)
  │
  ├──→ @vcds/tokens (reads prefix, generates --{prefix}-* vars)
  │      │
  │      ├──→ @vcds/css-components (imports _config.scss with $prefix)
  │      │      │
  │      │      ├──→ @vcds/react    (imports @vcds/shared for cls() helper)
  │      │      ├──→ @vcds/vue      (imports @vcds/shared for DS_PREFIX)
  │      │      ├──→ @vcds/svelte   (imports @vcds/shared for DS_PREFIX)
  │      │      ├──→ @vcds/angular  (imports @vcds/shared for cls() helper)
  │      │      ├──→ @vcds/html     (uses literal prefix in markup)
  │      │      └──→ @vcds/docs     (imports @vcds/react + @vcds/css-components)
  │      │
  │      └──→ @vcds/css (global reset, themes, utilities from tokens)
  │
  └──→ @vcds/shared (exports DS_PREFIX constant + cls() helper)
```

### The monorepo structure

The repo uses **pnpm workspaces** with the `workspace:*` protocol for internal
dependencies. This means packages reference each other by name, and pnpm
symlinks them locally during development.

```
pnpm-workspace.yaml → packages: ['packages/*']
```

All packages live under `packages/`. Each has its own `package.json` with real
dependencies and build scripts.

---

## 5. The Token System

### Three-tier hierarchy

Tokens follow a strict three-tier architecture. This is the most important
concept in the system.

```
TIER 1: Primitive tokens (raw values)
  color/blue-500: "#2563EB"
  spacing/4: "1rem"
  font-size/16: "1rem"

TIER 2: Semantic tokens (intent — theme-aware)
  color-action-primary: {value: "{color.blue.500}"}     ← light theme
  color-action-primary: {value: "{color.blue.300}"}     ← dark theme
  spacing-md: {value: "{spacing.4}"}

TIER 3: Component tokens (usage — optional)
  button-bg-default: {value: "{color-action-primary}"}
  card-padding: {value: "{spacing-md}"}
```

**Why three tiers?**

- Primitives are the raw palette. They never change between themes.
- Semantic tokens map intent to primitives. Switching themes changes only this
  mapping. "action-primary" might be blue-500 in light and blue-300 in dark.
- Component tokens are optional aliases that make component SCSS more readable.
  Most components reference semantic tokens directly.

**The rule:** Components must only use semantic or component tokens. Never
primitives. This is enforced by convention and agent rules, not tooling
(yet — linting is on the roadmap).

### Token file structure

```
packages/tokens/src/
├── primitives/
│   ├── color.json         # Full colour palette (blue-50 through blue-900, etc.)
│   ├── spacing.json       # Spacing scale (1 through 16)
│   ├── typography.json    # Font families, sizes, weights, line heights
│   └── elevation.json     # Box shadows (low, medium, high, highest)
├── semantic/
│   ├── light.json         # Light theme: maps primitives to semantic names
│   ├── dark.json          # Dark theme: same semantic names, different primitives
│   └── high-contrast.json # High contrast theme: WCAG AAA-friendly mappings
```

### Style Dictionary build

Style Dictionary reads the JSON files and outputs to multiple platforms:

| Platform | Output files | Format |
|----------|-------------|--------|
| Web (CSS) | `tokens.css`, `tokens-dark.css`, `tokens-high-contrast.css` | CSS custom properties |
| Web (SCSS) | `_tokens.scss` | SCSS variables |
| Web (JS) | `tokens.js`, `tokens.d.ts` | ES6 modules + TypeScript declarations |
| iOS | `DesignTokens.swift`, `ColorTokens.swift` | Swift enums |
| Android | `tokens.xml`, `colors.xml`, `dimens.xml` | Android XML resources |

The prefix is read from `ds.config.json` at build time and injected into the
custom transform (`name/ds-kebab`), so all output uses the configured prefix:
`--vcds-color-action-primary`, not `--color-action-primary`.

### Theme switching

Themes work via CSS selector overrides:

```css
:root {
  --vcds-color-action-primary: #2563EB;   /* light.json */
}

[data-theme="dark"] {
  --vcds-color-action-primary: #93C5FD;   /* dark.json */
}

[data-theme="high-contrast"] {
  --vcds-color-action-primary: #1D4ED8;   /* high-contrast.json */
}
```

No JavaScript is needed to switch themes — toggle the `data-theme` attribute on
any ancestor element.

---

## 6. The CSS-First Base Layer

### What it is

`@vcds/css-components` is a standalone CSS component library written in
BEM-structured SCSS. It consumes token CSS custom properties and compiles to
plain CSS. It has no JavaScript dependencies.

### Why CSS-first?

This decision was modelled on industry-proven design systems:

| System | CSS base | Framework consumers |
|--------|----------|-------------------|
| IBM Carbon | `@carbon/styles` | Carbon React, Carbon Vue, Carbon Web Components |
| Salesforce Lightning | Lightning Design System (CSS) | Lightning Web Components |
| GitHub Primer | Primer CSS | Primer React |
| Adobe Spectrum | Spectrum CSS | Spectrum Web Components, React Spectrum |

The pattern works because:

1. **Visual consistency is guaranteed mechanically.** All frameworks render the
   same CSS — there's no "the React version looks slightly different from Vue"
   problem.
2. **The CSS library is independently useful.** Teams using WordPress, Magento,
   static HTML, email templates, or server-rendered pages can use it directly
   without any JavaScript framework.
3. **Maintenance is centralised.** A visual change (border radius, hover colour,
   spacing) is made once in SCSS and automatically applies to all frameworks
   on rebuild.
4. **Adding a new framework is trivial.** A new framework wrapper only needs to
   map props to existing CSS class strings. The visual design is already done.

### BEM naming convention

All classes follow Block-Element-Modifier with a configurable prefix:

```
.{prefix}-{block}                       → .vcds-button
.{prefix}-{block}--{modifier}          → .vcds-button--primary
.{prefix}-{block}__{element}           → .vcds-button__icon-left
.{prefix}-{block}__{element}--{mod}    → .vcds-button__label--hidden
```

**Why BEM?**
- Flat specificity (single class selectors, no nesting wars)
- Self-documenting (class name tells you the component, element, and state)
- Framework-agnostic (works identically in React, Vue, Svelte, Angular, or plain HTML)
- No build tooling required to consume (unlike CSS Modules or CSS-in-JS)

### SCSS prefix interpolation

The prefix is defined in `_config.scss` as a SCSS variable:

```scss
$prefix: 'vcds' !default;
```

Every component SCSS file imports this and uses interpolation:

```scss
@use '../config' as cfg;

.#{cfg.$prefix}-button {
  background-color: var(--#{cfg.$prefix}-color-action-primary);
}
```

This compiles to `.vcds-button { background-color: var(--vcds-color-action-primary); }`.

When the prefix changes (via `scripts/set-prefix.js`), only `_config.scss` is
updated. All SCSS recompiles with the new prefix automatically.

### Adding a new CSS component

1. Create `packages/css-components/src/components/_component-name.scss`
2. Import config: `@use '../config' as cfg;`
3. Use `#{cfg.$prefix}` for all class names and token references
4. Register: add `@use 'components/component-name';` to `src/index.scss`
5. Build: `pnpm --filter @vcds/css-components build`

The blueprint at `blueprints/scss/Component.blueprint.scss` provides the
annotated template.

---

## 7. The Configurable Prefix

### The problem it solves

Design systems get forked. Companies white-label them. Multiple design systems
coexist on the same page. Without namespacing, class names and CSS variables
collide. The prefix prevents this.

### How it works — three source files

The prefix is defined in one place and read by three systems:

| File | What reads it | What it produces |
|------|---------------|-----------------|
| `ds.config.json` | Style Dictionary (at build time) | `--vcds-color-*` CSS custom properties |
| `packages/css-components/src/_config.scss` | SCSS compiler | `.vcds-button` class names |
| `packages/shared/prefix.ts` | React, Vue, Svelte, Angular (at compile time) | `cls('button', 'primary')` → `'vcds-button--primary'` |

### The `set-prefix.js` script

```bash
node scripts/set-prefix.js <your-prefix>
```

This script:
1. Validates the prefix (lowercase alphanumeric, optional hyphens, no leading/trailing hyphens)
2. Updates `ds.config.json`, `_config.scss`, `prefix.ts` (the 3 source-of-truth files)
3. Propagates the prefix across all text files — HTML examples, docs, agent configs, etc.

After running, `pnpm build` recompiles everything with the new prefix. No manual
find-and-replace. No missed references.

### The `cls()` helper

Framework components never hardcode prefix strings. They import a helper:

```typescript
import { DS_PREFIX, cls } from '@vcds/shared/prefix';

cls('button')                    // → 'vcds-button'
cls('button', 'primary')         // → 'vcds-button--primary'
cls('button', null, 'icon-left') // → 'vcds-button__icon-left'
```

This means framework components are prefix-agnostic. They work with any prefix
without modification.

### HTML reference pages

The HTML examples in `packages/html/examples/` use the literal prefix in markup.
These are not dynamically generated — they use the default prefix (`vcds-`). A
note in the HTML comments explains this. If the prefix is changed, HTML examples
should be regenerated or manually updated. This is an accepted trade-off for
keeping the HTML examples dependency-free.

---

## 8. Framework Wrappers

### What they do

Framework packages provide:
- **Typed props** — TypeScript interfaces for all component APIs
- **Event handling** — onClick (React), @click (Vue), onclick (Svelte), @Output() (Angular)
- **State management** — loading, disabled, controlled/uncontrolled patterns
- **Slot/children composition** — iconLeft, iconRight, default slot
- **Accessibility behaviour** — aria-disabled, aria-busy, keyboard handlers
- **Ref forwarding** — React forwardRef, Vue template refs

### What they don't do

Framework packages never:
- Define visual styles (no CSS, no style attributes, no CSS Modules, no scoped styles)
- Import stylesheets (the consuming app imports `@vcds/css-components` at the entry point)
- Hardcode the prefix string (they import `cls()` or `DS_PREFIX` from `@vcds/shared`)

### The pattern

**React** uses `forwardRef` with the `cls()` helper:

```tsx
import { cls } from '@vcds/shared/prefix';

const classNames = [
  cls('button'),
  cls('button', variant),
  cls('button', size),
].filter(Boolean).join(' ');

return <button className={classNames} {...rest}>{children}</button>;
```

**Vue** uses template class bindings with `DS_PREFIX`:

```vue
<template>
  <button :class="[`${p}-button`, `${p}-button--${variant}`]">
    <slot />
  </button>
</template>
```

**Svelte** uses `$derived` for reactive class composition:

```svelte
<script>
  let buttonClass = $derived(`${p}-button ${p}-button--${variant}`);
</script>
<button class={buttonClass}>{@render children()}</button>
```

**Angular** uses standalone components with `[ngClass]` and `cls()`:

```typescript
@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [NgClass],
  template: `<button [ngClass]="buttonClasses"><ng-content></ng-content></button>`,
})
export class DsButtonComponent {
  @Input() variant = 'primary';
  get buttonClasses() { return [cls('button'), cls('button', this.variant)].join(' '); }
}
```

### How consumers use it

The consuming application imports CSS once at the entry point, then uses
components normally:

```tsx
// App entry point
import '@vcds/tokens/platforms/web/tokens.css';
import '@vcds/css-components/dist/index.css';

// In components
import { Button } from '@vcds/react';

<Button variant="primary" size="md" onClick={save}>Save</Button>
```

---

## 9. The Agent System

### Why agents are first-class

This repo is built for "vibe coding" — AI-assisted development where the
developer describes intent and the AI generates code. For this to work well,
the AI must understand the system deeply: architecture, conventions, token
hierarchy, accessibility requirements, naming patterns, file locations, and
build order.

Without agent configuration, every AI interaction starts from zero. With it,
the AI is an informed contributor from the first prompt.

### Seven IDEs, consistent rules

| IDE | Config file | Format |
|-----|------------|--------|
| Cursor | `.cursor/rules/*.mdc` | Markdown with YAML frontmatter + globs |
| Claude Code | `CLAUDE.md` | Markdown (read automatically) |
| Windsurf | `.windsurfrules` | Markdown (read by Cascade) |
| GitHub Copilot | `.github/copilot-instructions.md` | Markdown |
| Google Antigravity | `.antigravity/rules.md` | Markdown (also reads `AGENTS.md`) |
| OpenCode | `AGENTS.md` | Markdown (falls back to `CLAUDE.md` if absent) |
| OpenAI Codex | `AGENTS.md` + `.codex/config.toml` | Markdown for rules, TOML for MCP servers |

The content across these files is kept consistent. They all teach:
- The CSS-first architecture and why it matters
- The token three-tier hierarchy
- The configurable prefix and how it flows
- BEM naming convention with examples
- Component creation order (SCSS → HTML → wrappers → tests → stories)
- Accessibility requirements (WCAG 2.2 AA)
- Build commands and their correct order
- File locations for every type of artifact

Cursor splits this into three focused rule files (design-system, components,
tokens) scoped by glob patterns so rules activate only when relevant files are
open.

### Blueprints

The `blueprints/` directory contains annotated skeleton files for every type of
artifact an agent might create:

```
blueprints/
├── scss/        Component.blueprint.scss     ← Start here (CSS-first)
├── html-css/    Component.blueprint.html     ← HTML reference page
├── react/       Component.blueprint.tsx      ← React wrapper
├── vue/         Component.blueprint.vue      ← Vue wrapper
├── svelte/      Component.blueprint.svelte   ← Svelte wrapper
└── angular/     Component.blueprint.ts       ← Angular wrapper
```

These are not abstract templates. They contain working placeholder code with
comments explaining every decision. An agent copies a blueprint, replaces
placeholders, and has a correctly structured component.

### Prompts and skills

`prompts/` contains tested, copy-paste prompts for common tasks (component
generation, token management, accessibility audits). These are optimised for
AI agents — they reference specific file paths, mention all required artifacts,
and include the correct creation order.

`skills/` contains capability descriptions that agents can reference to
understand what tools and techniques are available (accessibility patterns,
frontend coding conventions, Figma integration, etc.).

---

## 10. The Figma Integration

This repo supports three Figma integration paths, each serving different needs.
**Figma Console MCP is the preferred and most powerful option.**

### 10.1 Figma Console MCP (preferred — full design system API)

**What it is:** An open-source MCP server by SouthLeft that turns your Figma
design system into a queryable, programmable API. It provides **56+ tools** for
extraction, creation, and debugging — far beyond what the official Figma MCP
offers.

**Why it's preferred for this starter kit:**

The Figma Console MCP directly solves the design-to-code problem this repo
exists to address. It can extract design tokens from Figma and export them as
CSS custom properties, Tailwind config, Sass variables, or JSON — which maps
directly to our Style Dictionary token workflow. It can read component specs
with visual references and help implement them using our BEM conventions. And
it can create and modify designs programmatically, enabling bidirectional
design-code workflows.

**Capabilities (56+ tools):**

| Category | What it does | Key tools |
|----------|-------------|-----------|
| **Design System Extraction** | Extract variables, styles, and components as structured data. Export to CSS custom properties, Tailwind, Sass, or JSON. | `figma_get_variables`, `figma_get_styles`, `figma_get_component`, `figma_get_design_system_summary` |
| **Design Creation** | Execute Figma Plugin API code directly. Build, modify, and organise components programmatically via natural language. | `figma_execute`, `figma_arrange_component_set`, `figma_create_variable`, plus 20+ node manipulation tools |
| **Component Implementation** | Get component specs with visual references, layout properties, colour values, and typography — ready for implementation. | `figma_get_component_for_development`, `figma_get_component_image`, `figma_capture_screenshot` |
| **Plugin Debugging** | Real-time console log capture from Figma plugins. Filter by level, stream live, capture UI state. | `figma_get_console_logs`, `figma_watch_console`, `figma_take_screenshot` |
| **Variable Management** | Create, update, and organise design tokens directly in Figma. Add modes (light/dark), manage collections. | `figma_create_variable`, `figma_update_variable`, `figma_add_mode` |

**Two setup modes:**

| Mode | Tools | Capabilities | Requirements |
|------|-------|-------------|-------------|
| **NPX Setup** (recommended) | 56+ | Full read/write: extract, create, modify, debug | Node.js 18+, Figma Desktop, Desktop Bridge Plugin, Personal Access Token |
| **Remote SSE** (quick eval) | 21 | Read-only: view data, take screenshots | Just an MCP client (Claude Desktop, etc.) |

**How it connects:** The NPX setup runs a local MCP server that communicates
with Figma Desktop via a WebSocket Desktop Bridge Plugin. The plugin is
imported once into Figma (Plugins → Development → Import from manifest) and
auto-connects when run. No special Figma launch flags needed.

**Setup in `.mcp.json`:**

```json
{
  "figma-console": {
    "command": "npx",
    "args": ["-y", "figma-console-mcp@latest"],
    "env": {
      "FIGMA_ACCESS_TOKEN": "<YOUR_FIGMA_ACCESS_TOKEN>",
      "ENABLE_MCP_APPS": "true"
    }
  }
}
```

**Design system workflows it enables:**

1. **Token extraction:** "Get all design variables from my Figma file and export
   them as CSS custom properties" → AI extracts variables via
   `figma_get_variables` and outputs ready-to-use CSS that maps to our token
   JSON structure.

2. **Component implementation:** "Get the Tooltip component from this Figma URL
   and help me implement it following our CSS-first architecture" → AI fetches
   component data with visual reference, extracts layout/styling/properties,
   and generates SCSS + framework wrappers using our BEM conventions.

3. **Design system audit:** "Get all variables and show me where each one is
   used" → AI extracts variables with enrichment and provides usage analysis.

4. **Programmatic creation:** "Create a button component set with 4 variants,
   3 sizes, and 5 states, bound to my design system variables" → AI creates
   60 variants directly in Figma using Plugin API, applies variable bindings,
   and organises the component set with labels.

5. **Token migration:** "Compare my old Figma styles with new variables and
   generate migration scripts" → AI maps old to new, identifies breaking
   changes, and suggests migration approach.

**Complementary use with Figma Dev Mode MCP:** The two MCP servers work
together. Use Dev Mode MCP for initial code generation from designs, then
Console MCP to replace hardcoded values with actual design tokens:

```
Step 1 (Dev Mode MCP):  <Button className="bg-[#4375ff]">Click me</Button>
Step 2 (Console MCP):   --vcds-color-action-primary: #4375FF
Step 3 (You refactor):  <Button className="vcds-button vcds-button--primary">Click me</Button>
```

**Documentation:** https://docs.figma-console-mcp.southleft.com/

### 10.2 Figma Dev Mode MCP (official — code generation)

**What it is:** Anthropic's official Figma MCP server. Connects to Figma's Dev
Mode API to inspect designs, extract specs, and generate code from frames.

**When to use it:** For quick component code generation from Figma designs. It
reads design specs (layout, colours, typography) and produces framework code.
However, it doesn't understand design tokens, can't export variables, and
can't create or modify designs.

**Setup in `.mcp.json`:**

```json
{
  "figma": {
    "command": "npx",
    "args": ["-y", "@anthropic/figma-mcp-server"],
    "env": {
      "FIGMA_ACCESS_TOKEN": "<YOUR_FIGMA_ACCESS_TOKEN>"
    }
  }
}
```

**Limitations vs Console MCP:**
- Read-only (no design creation or modification)
- No variable/token extraction or export
- No Plugin API access
- No console log debugging
- No variable management

### 10.3 Figma CLI (Claude Code, OpenCode + Codex only — direct binary access)

**What it is:** A direct binary interface to Figma Desktop that enables
read/write operations from terminal-based AI tools. Installed via
`scripts/setup-figma-cli.js`.

**When to use it:** For terminal-based workflows in Claude Code, OpenCode, or Codex
where you need direct file access outside of the MCP protocol. Useful for
batch operations and scripting.

**Risk gating:**
- **Safe mode** (default): Read-only operations, confirmations before actions
- **Yolo mode**: Full read/write access, no confirmations

**Documentation:** `guides/figma-cli/README.md` and `skills/figma-cli.md`

### Why three integrations?

| Integration | Best for | Works in |
|------------|----------|----------|
| **Figma Console MCP** | Full design system workflows: token extraction, component implementation, design creation, variable management | All MCP-compatible IDEs (Cursor, Claude Code, Windsurf, Claude Desktop, VS Code Copilot, etc.) |
| **Figma Dev Mode MCP** | Quick code generation from design specs | All MCP-compatible IDEs |
| **Figma CLI** | Direct binary access, batch scripting, terminal workflows | Claude Code, OpenCode, Codex |

For most design system work, **Figma Console MCP alone covers everything you
need.** The other two are complementary options for specific workflows.

---

## 11. Build Chain — How Everything Connects

### Build order (critical)

```
Step 1: @vcds/tokens
        Style Dictionary reads ds.config.json for prefix,
        compiles JSON → CSS vars, SCSS, JS, Swift, XML

Step 2: @vcds/css-components
        Sass compiler reads _config.scss for $prefix,
        compiles SCSS → dist/index.css (minified) + dist/index.expanded.css

Step 3: @vcds/css
        Compiles global CSS from token variables

Step 4: @vcds/react, @vcds/vue, @vcds/svelte, @vcds/angular (parallel)
        TypeScript compilation, bundling
        Each imports @vcds/shared for the prefix constant

Step 5: @vcds/docs
        Storybook builds from @vcds/react components + @vcds/css-components styles
```

The root `pnpm build` command enforces this order. Steps 1 and 2 must complete
before anything else. Steps 4 can run in parallel.

### What happens when you change a token

1. Edit `packages/tokens/src/semantic/light.json`
2. Run `pnpm build:tokens` — regenerates `--vcds-color-*` CSS custom properties
3. Run `pnpm build:css` — recompiles SCSS (which references those variables)
4. Framework packages don't need rebuilding (they reference classes, not values)
5. Storybook hot-reloads if running

### What happens when you change the prefix

1. Run `node scripts/set-prefix.js newprefix`
2. Script updates: `ds.config.json`, `_config.scss`, `prefix.ts`
3. Run `pnpm build` — everything recompiles with the new prefix
4. CSS output: `.newprefix-button`, `--newprefix-color-action-primary`
5. JS output: `DS_PREFIX = 'newprefix'`, `cls('button')` returns `'newprefix-button'`

### What happens when you add a component

1. Create SCSS in `packages/css-components/src/components/`
2. Register in `src/index.scss`
3. Run `pnpm build:css` — new component classes are in `dist/index.css`
4. Create HTML example in `packages/html/examples/`
5. Create React/Vue/Svelte/Angular wrappers (import `cls()` from `@vcds/shared`)
6. Create Storybook stories
7. Run `pnpm build` to verify everything compiles

---

## 12. How to Extend This System

### Adding a new framework (e.g., Solid, Web Components)

1. Create `packages/{framework}/` with a `package.json`
2. Add `@vcds/css-components`, `@vcds/shared`, and `@vcds/tokens` as dependencies
3. Create components that import `cls()` or `DS_PREFIX` from `@vcds/shared`
4. Map framework-specific props/directives to BEM class strings
5. Do not define any styles — all visuals come from `@vcds/css-components`
6. Create a blueprint in `blueprints/{framework}/`
7. Add an agent config file if the framework has its own IDE

### Adding mobile support (iOS, Android, React Native)

1. Style Dictionary already outputs iOS Swift and Android XML
2. Create `packages/{platform}/` wrapping the Style Dictionary output
3. Mobile components consume tokens directly (skip the CSS layer)
4. There is no CSS-to-native translation — tokens are the universal bridge

### Adding a new component

Follow the CSS-first creation order documented in CONTRIBUTING.md:
1. SCSS → 2. HTML → 3. Framework wrappers → 4. Tests → 5. Stories

### Integrating with an existing project

The CSS components are designed to coexist. The prefix prevents collisions.
The consuming project imports the CSS and uses components normally:

```html
<!-- In any HTML page -->
<link rel="stylesheet" href="path/to/tokens.css" />
<link rel="stylesheet" href="path/to/css-components/index.css" />

<button class="vcds-button vcds-button--primary vcds-button--md">
  Works alongside your existing styles
</button>
```

### White-labeling for a client

1. Clone the repo
2. Run `node scripts/set-prefix.js clientname`
3. Replace token values in `packages/tokens/src/` with client brand colours, typography, spacing
4. Run `pnpm build`
5. The entire system now uses client-prefixed classes and brand tokens

---

## 13. Decision Log

A record of key architectural decisions and their reasoning.

### D1: Multi-framework over single-framework
**Decision:** Support React, Vue, Svelte, and Angular from day one.
**Reasoning:** Design systems serve diverse teams. Locking into one framework
limits adoption. The CSS-first approach makes multi-framework support cheap
since visual styles are shared.

### D2: CSS-first base layer over co-located styles
**Decision:** All visual styles in `@vcds/css-components`, not in framework components.
**Reasoning:** Eliminates style duplication (previously, the same button styles
existed in three framework files). Guarantees visual parity. Enables HTML/CSS-only
usage. Follows the pattern proven by Carbon, Primer, Lightning, and Spectrum.

### D3: BEM over CSS Modules, Tailwind, or CSS-in-JS
**Decision:** BEM naming with configurable prefix.
**Reasoning:** BEM is framework-agnostic, requires no build tooling to consume,
has flat specificity, and is self-documenting. CSS Modules required per-framework
setup. Tailwind doesn't produce reusable component classes. CSS-in-JS doesn't
work for non-JS consumers.

### D4: Configurable prefix over hardcoded prefix
**Decision:** Prefix defined in `ds.config.json`, propagated via script.
**Reasoning:** Design systems get forked and white-labeled. A configurable prefix
is a one-command operation. The alternative (manual find-and-replace) is error-prone
and doesn't scale.

### D5: Seven IDE configs over "just Cursor"
**Decision:** Support Cursor, Claude Code, Windsurf, Copilot, Antigravity, OpenCode, and OpenAI Codex.
**Reasoning:** The starter kit should work for any team regardless of their IDE
choice. Each config file is small and low-maintenance. The content is consistent
so keeping them in sync is straightforward. Codex reuses `AGENTS.md` (same as
OpenCode) and adds `.codex/config.toml` for MCP server configuration in TOML format.

### D6: One golden component over many starter components
**Decision:** Ship one deeply-considered Button over a dozen shallow components.
**Reasoning:** A golden example teaches everything — token usage, BEM naming,
prefix interpolation, accessibility patterns, TypeScript types, testing approach.
Shallow components teach nothing and need to be rewritten. The Button demonstrates
the complete workflow that agents follow to create new components.

### D7: pnpm workspaces over Turborepo/Nx
**Decision:** Plain pnpm workspaces with `workspace:*` protocol.
**Reasoning:** pnpm workspaces are simple, well-documented, and sufficient for
this project's scale. Turborepo/Nx add caching and task orchestration but also
add complexity and learning curve. The build chain is small enough that caching
isn't a bottleneck. Can be added later if needed.

### D8: Style Dictionary over custom token build
**Decision:** Use Style Dictionary for all token compilation.
**Reasoning:** Industry standard for design tokens. Supports every output format
we need (CSS, SCSS, JS, Swift, Kotlin, XML). Extensible via custom transforms.
Active open-source community. The alternative (custom scripts) would require
maintaining format-specific serialisers.

### D9: Changesets over Lerna or manual versioning
**Decision:** Use Changesets for versioning and publishing.
**Reasoning:** Changesets integrates cleanly with pnpm workspaces, supports
monorepo versioning, generates changelogs, and works with GitHub Actions. It's
the standard for modern JS monorepos.

### D10: `cls()` helper over template literals in frameworks
**Decision:** Provide a `cls()` helper function alongside the raw `DS_PREFIX` constant.
**Reasoning:** `cls('button', 'primary')` is more readable and less error-prone
than `` `${DS_PREFIX}-button--${variant}` ``. It handles the BEM structure
(block, modifier, element) correctly every time. Framework components that use
it can't accidentally malform a class name.

---

*For rules and conventions (what to do), see `CLAUDE.md` or `AGENTS.md`.*
*For contribution workflow (how to submit), see `CONTRIBUTING.md`.*
*For quick start (how to run), see `README.md`.*
