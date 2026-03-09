<div align="center">

<pre>
                        ██╗   ██╗ ██████╗██████╗ ███████╗                         
                        ██║   ██║██╔════╝██╔══██╗██╔════╝                         
                        ██║   ██║██║     ██║  ██║███████╗                         
                        ╚██╗ ██╔╝██║     ██║  ██║╚════██║                         
                         ╚████╔╝ ╚██████╗██████╔╝███████║                         
                          ╚═══╝   ╚═════╝╚═════╝ ╚══════╝                         
                                                                                  
███████╗████████╗ █████╗ ██████╗ ████████╗███████╗██████╗     ██╗  ██╗██╗████████╗
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██╔════╝██╔══██╗    ██║ ██╔╝██║╚══██╔══╝
███████╗   ██║   ███████║██████╔╝   ██║   █████╗  ██████╔╝    █████╔╝ ██║   ██║   
╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ██╔══╝  ██╔══██╗    ██╔═██╗ ██║   ██║   
███████║   ██║   ██║  ██║██║  ██║   ██║   ███████╗██║  ██║    ██║  ██╗██║   ██║   
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝   ╚═╝   
                                                                                  
</pre>

[![Vibe Coding](https://img.shields.io/badge/Vibe_Coding-Design_System-blueviolet?style=for-the-badge)](https://github.com/jacqueskeet/vibe-coding-design-system-starter-kit)
[![Frameworks](https://img.shields.io/badge/React_|_Vue_|_Svelte_|_Angular-blue?style=for-the-badge)](https://github.com/jacqueskeet/vibe-coding-design-system-starter-kit)
[![AI Agent Ready](https://img.shields.io/badge/AI_Agent-Ready-brightgreen?style=for-the-badge)](https://github.com/jacqueskeet/vibe-coding-design-system-starter-kit)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-gold?style=for-the-badge)](https://github.com/jacqueskeet/vibe-coding-design-system-starter-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**Vibe-Coding Design System Starter Kit. Build your design system with AI agents.**

Multi-framework. Token-driven. Accessible by default.

Works with Cursor, Claude Code, Windsurf, Copilot, Antigravity, and OpenCode.

</div>

---

## What is This?

A **vibe coding-ready design system monorepo** — everything you need to build, maintain, and scale a production design system with AI agents:

- **🎨 Design Tokens** — Style Dictionary v4 compiles to CSS, SCSS, JS/TS, Swift, Kotlin, and Android XML from a single source
- **⚛️ Multi-Framework** — Shared component libraries for React, Vue, Svelte, and Angular, all driven by the same tokens and CSS
- **🏗️ CSS-First Architecture** — BEM-structured SCSS is the single source of truth; framework packages are thin wrappers
- **🤖 AI Agent Integration** — Pre-configured rules for Cursor, Claude Code, Windsurf, GitHub Copilot, Google Antigravity, and OpenCode
- **♿ Accessibility** — WCAG 2.2 AA baked in with checklists, patterns, axe-core testing, and focus management
- **🧩 Headless Library Support** — Optional step during setup to add Radix UI, Base UI, Headless UI, Ark UI, Angular Primitives, or Zag.js as behaviour primitives
- **🧙 Interactive Setup** — Run `./setup.sh` and a setup wizard detects prerequisites, installs what's missing, then configures naming, prefix, frameworks, headless library, Figma, and IDE integration

---

## Quick Start

```bash
# 1. Clone into your project folder (replace "my-design-system" with your name)
git clone https://github.com/jacqueskeet/vibe-coding-design-system-starter-kit.git my-design-system
cd my-design-system

# 2. Run the setup wizard
./setup.sh
```

That's it. The setup script checks for Node.js and pnpm (and helps you install them
if missing), then launches the interactive wizard for naming, prefix, framework
selection, headless UI library, Figma integration, and IDE configuration — then
installs dependencies and builds everything automatically.

> **Tip:** The folder name you choose (`my-design-system` above) is just your local directory.
> The setup wizard will ask for your design system's actual name and configure everything for you.

After setup, start building:

```bash
pnpm dev        # Start Storybook (localhost:6006)
pnpm build      # Rebuild everything
pnpm -w test    # Run tests
```

<details>
<summary>Manual setup (requires Node.js 20+ and pnpm already installed)</summary>

```bash
pnpm install
node scripts/set-prefix.js myds    # → .myds-button, --myds-color-*
pnpm build
pnpm dev
```
</details>

### IDE Setup

| IDE / Agent | What happens automatically |
|-------------|---------------------------|
| **Cursor** | Reads `.cursor/rules/` — agent understands tokens, components, a11y |
| **Claude Code** | Reads `CLAUDE.md` — full system context in every prompt |
| **Windsurf** | Reads `.windsurfrules` — Cascade gets design system conventions |
| **GitHub Copilot** | Reads `.github/copilot-instructions.md` — suggestions follow your patterns |
| **Google Antigravity** | Reads `.antigravity/rules.md` — agents get design system context across all surfaces |
| **OpenCode** | Reads `AGENTS.md` — build and plan agents follow your conventions |

### MCP Servers

The `.mcp.json` at the repo root pre-configures:
- **Figma Console MCP** (preferred) — 56+ tools: extract design tokens, create components, manage variables, debug plugins. Your design system as a queryable API.
- **Figma Dev Mode MCP** — Official read-only code generation from Figma designs
- **Storybook MCP** — AI can read and reference your component docs

See [guides/figma-setup.md](./guides/figma-setup.md) for API key configuration.
Full Figma Console MCP docs: https://docs.figma-console-mcp.southleft.com/

---

## Repo Structure

```
design-system-starter/
├── ds.config.json       # ← Source of truth for prefix + DS metadata
├── packages/
│   ├── tokens/          # Design tokens (Style Dictionary) — universal base
│   ├── css-components/  # BEM component CSS — web base layer
│   │   └── src/_config.scss  # ← SCSS $prefix variable
│   ├── shared/          # Shared config (DS_PREFIX constant, cls() helper)
│   ├── css/             # Global CSS, themes, reset
│   ├── html/            # HTML reference markup (no framework needed)
│   ├── react/           # React — thin wrappers over css-components
│   ├── vue/             # Vue 3 — thin wrappers over css-components
│   ├── svelte/          # Svelte — thin wrappers over css-components
│   ├── angular/         # Angular 17+ — thin wrappers over css-components
│   └── docs/            # Storybook documentation site
├── blueprints/          # Component skeleton templates
│   ├── react/           # React component blueprint
│   ├── vue/             # Vue component blueprint
│   ├── svelte/          # Svelte component blueprint
│   ├── angular/         # Angular component blueprint
│   ├── scss/            # SCSS component blueprint (css-components)
│   └── html-css/        # HTML reference blueprint
├── prompts/             # Tested prompts for common DS tasks
├── skills/              # Agent skill files (design, code, tokens, a11y)
├── snippets/            # IDE code snippets per framework
├── guides/              # Setup guides (Figma, Storybook, frameworks, a11y)
├── a11y/                # Accessibility checklists, patterns, testing
├── testing/             # Visual regression + a11y test configs
├── docs/                # Architecture deep-dive, design principles, decision log
│   └── ARCHITECTURE.md  # ← Read this first for full system context
├── setup.sh             # ← Bootstrap: detects/installs Node, pnpm, then runs wizard
├── scripts/
│   ├── set-prefix.js    # ← CLI to change prefix everywhere
│   └── setup-figma-cli.js
├── tools/               # External tool integrations (gitignored)
├── .cursor/rules/       # Cursor agent rules
├── .antigravity/        # Google Antigravity agent rules
├── CLAUDE.md            # Claude Code project context
├── AGENTS.md            # OpenCode agent rules (also read by Antigravity)
├── .windsurfrules       # Windsurf Cascade rules
└── .github/
    ├── copilot-instructions.md
    └── workflows/       # CI/CD pipelines
```

---

## Packages

### `@vcds/tokens`
Design tokens defined in JSON, built via **Style Dictionary** to multiple platforms:
- **Web** → CSS custom properties, SCSS variables, JS/TS modules
- **iOS** → Swift enums, UIKit extensions
- **Android** → Kotlin objects, XML resources

### `@vcds/css-components` ← **New: the base layer**
BEM-structured CSS component library. This is the single source of truth for all visual design. Every framework package consumes these classes — they never define their own styles.

### `@vcds/css`
Global CSS generated from tokens, plus a CSS reset, utility classes, and theme files (light / dark / high-contrast).

### `@vcds/react` · `@vcds/vue` · `@vcds/svelte` · `@vcds/angular`
Thin framework wrappers that map props to `@vcds/css-components` BEM classes and add interactivity (events, state, slots/children). Components include accessible markup (WCAG 2.2 AA), TypeScript types / prop validation, unit tests, and Storybook stories. Angular uses standalone components (17+) with `@Input()` props and `[ngClass]` bindings, built via ng-packagr.

### `@vcds/html`
Reference HTML markup showing how to use `@vcds/css-components` directly — no JavaScript framework required. Perfect for static sites, CMSs, email templates, or server-rendered pages.

### `@vcds/docs`
Storybook 8 instance documenting all components across frameworks with usage examples, props tables, and accessibility notes.

---

## Configurable Prefix

Every class name and CSS variable uses a prefix defined in `ds.config.json`. The default is `vcds`:

```
Classes:    .vcds-button, .vcds-button--primary, .vcds-card__header
Variables:  --vcds-color-action-primary, --vcds-spacing-md
```

Change it anytime:

```bash
node scripts/set-prefix.js <your-prefix>   # e.g. acme, myds, your-brand
pnpm build                                 # Rebuild everything with new prefix
```

This updates three files that propagate to the entire system:
1. `ds.config.json` — source of truth
2. `packages/css-components/src/_config.scss` — SCSS `$prefix` variable
3. `packages/shared/prefix.ts` — JS/TS `DS_PREFIX` constant + `cls()` helper

No find-and-replace needed. Framework wrappers read the prefix at build time.

---

## Architecture

```
Layer 1: @vcds/tokens              ← Universal. Compiles to ALL platforms.
            │
            ├── Web: CSS custom properties, SCSS variables
            ├── iOS: Swift enums, UIKit extensions
            └── Android: Kotlin objects, XML resources

Layer 2: @vcds/css-components      ← Web base layer. BEM classes from tokens.
            │
            ├── @vcds/react        ← Props → BEM classes + React interactivity
            ├── @vcds/vue          ← Props → BEM classes + Vue interactivity
            ├── @vcds/svelte       ← Props → BEM classes + Svelte interactivity
            ├── @vcds/angular      ← Props → BEM classes + Angular interactivity
            └── @vcds/html         ← Use BEM classes directly (no framework)

Mobile:  @vcds/tokens → iOS / Android / React Native (skip CSS layer)
```

## Design Tokens

Tokens follow a **three-tier architecture**:

```
Primitive → Semantic → Component
────────────────────────────────
blue-500  → color-action-primary → button-bg-default
space-4   → spacing-md           → card-padding
```

See [packages/tokens/README.md](./packages/tokens/README.md) for the full taxonomy and build instructions.

---

## Vibe Coding Workflows

### Generate a new component (CSS-first)
> "Create a new Badge component. Start with the SCSS in css-components following the blueprint in /blueprints/scss/. Then create React, Vue, Svelte, and Angular wrappers using the framework blueprints. Support variants: default, success, warning, error. Include an HTML reference page."

### Add to HTML/CSS only
> "I need a Card component for our Magento site. Create the SCSS in css-components and an HTML reference page with all variants. I don't need framework wrappers."

### Generate a new component (framework wrappers)
> "Create React, Vue, Svelte, and Angular wrappers for the existing Badge css-component. Map variants and sizes to BEM classes. Include TypeScript types and a11y attributes."

### Add a token
> "Add a semantic token `color-feedback-info` mapped to `blue-400` in light and `blue-300` in dark theme. Rebuild tokens and css-components."

### Audit for accessibility
> "Run an a11y audit on the Card component against /a11y/checklists/component.md."

See [prompts/](./prompts/) for a full library of tested prompts.

---

## Headless UI Libraries

During setup, you can optionally choose a headless UI library to add behaviour primitives on top of the design system. The wizard filters options based on your selected frameworks and installs the relevant packages automatically.

| Library | Frameworks | Guide |
|---------|-----------|-------|
| **Radix UI** | React | [guides/framework-integration/radix.md](./guides/framework-integration/radix.md) |
| **Base UI** | React | [guides/framework-integration/base-ui.md](./guides/framework-integration/base-ui.md) |
| **Headless UI** | React, Vue | [guides/framework-integration/headless-ui.md](./guides/framework-integration/headless-ui.md) |
| **Ark UI** | React, Vue, Svelte | [guides/framework-integration/ark-ui.md](./guides/framework-integration/ark-ui.md) |
| **Angular Primitives** | Angular | [guides/framework-integration/angular-primitives.md](./guides/framework-integration/angular-primitives.md) |
| **Zag.js** | All frameworks | [guides/framework-integration/zag.md](./guides/framework-integration/zag.md) |
| **shadcn/ui** | React (reference) | [guides/framework-integration/shadcn.md](./guides/framework-integration/shadcn.md) |

> **Note:** shadcn/ui is a CLI-based copy-paste tool, so it isn't offered as a setup wizard option. Its guide is kept as reference documentation.

---

## CI/CD

Pre-configured GitHub Actions:
- **`ci.yml`** — Lint, type-check, test, build tokens, a11y checks (axe-core)
- **`deploy-storybook.yml`** — Deploy Storybook to GitHub Pages on merge
- **`publish.yml`** — Publish packages to npm via Changesets

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) — written for both humans and AI agents.

## License

MIT
