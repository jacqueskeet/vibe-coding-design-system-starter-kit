# Figma Desktop CLI — Agent Skill

> This skill is for Claude Code and OpenCode users who have set up the figma-cli integration.
> If the user has not installed figma-cli, direct them to `guides/figma-setup.md` → Option B.

## Overview

The figma-cli connects directly to Figma Desktop via Chrome DevTools Protocol. It provides read/write access to Figma files without an API key. The CLI lives in `tools/figma-cli/` relative to the repo root.

## Prerequisites

Before using any figma-cli commands, verify the connection:

```bash
node tools/figma-cli/src/index.js status
```

If not connected, the user needs to run:
```bash
cd tools/figma-cli && node src/index.js connect      # Yolo Mode
cd tools/figma-cli && node src/index.js connect --safe # Safe Mode
```

## Command Reference for Design System Tasks

### Design Token Extraction

Extract existing Figma variables and map them to the token architecture:

```bash
# List all variable collections in the current file
node tools/figma-cli/src/index.js variables list

# Export variables as CSS custom properties
node tools/figma-cli/src/index.js variables export --format css

# Export variables as Tailwind config
node tools/figma-cli/src/index.js variables export --format tailwind
```

**Workflow — Sync Figma variables to token JSON:**
1. Export variables with `variables list`
2. Map exported values to `packages/tokens/src/primitives/` and `packages/tokens/src/semantic/`
3. Run `pnpm --filter @vcds/tokens build` to regenerate platform outputs
4. Verify generated CSS vars match Figma values

### Design Token Creation

Push tokens FROM the codebase INTO Figma:

```bash
# Create a variable collection
node tools/figma-cli/src/index.js variables create-collection "Semantic Colors"

# Add a mode (Light/Dark)
node tools/figma-cli/src/index.js variables add-mode "Semantic Colors" "Dark"

# Batch create variables
node tools/figma-cli/src/index.js variables batch-create "Semantic Colors" \
  --vars "color-action-primary=#2563EB,color-action-secondary=#475569"

# Create full Tailwind palette
node tools/figma-cli/src/index.js create-tailwind-colors
```

### Design Analysis

Before building components, analyze the existing Figma file:

```bash
# Analyze all colors used (finds hardcoded values vs variables)
node tools/figma-cli/src/index.js analyze colors

# Analyze typography (all font/size/weight combinations)
node tools/figma-cli/src/index.js analyze typography

# Analyze spacing (gaps, padding values, grid compliance)
node tools/figma-cli/src/index.js analyze spacing

# Find repeated patterns (potential components)
node tools/figma-cli/src/index.js analyze clusters
```

**Use analysis results to:**
- Identify primitive token values that need to be added
- Find inconsistencies between Figma and the token system
- Detect elements that should be componentized

### Component Inspection

Read component data for code generation:

```bash
# List all components on the current page
node tools/figma-cli/src/index.js list --type COMPONENT

# Get detailed properties of a node
node tools/figma-cli/src/index.js inspect <nodeId>

# Get the full node tree
node tools/figma-cli/src/index.js tree <nodeId>

# Find nodes by name
node tools/figma-cli/src/index.js find "Button"
```

### Linting & Accessibility

Run design linting before generating code:

```bash
# Run all lint rules
node tools/figma-cli/src/index.js lint

# Specific checks
node tools/figma-cli/src/index.js lint --rules color-contrast
node tools/figma-cli/src/index.js lint --rules touch-target-size
node tools/figma-cli/src/index.js lint --rules no-hardcoded-colors

# Check text contrast against background
node tools/figma-cli/src/index.js check-contrast <nodeId>
```

**Available lint rules:**
- `no-default-names` — detect unnamed layers ("Frame 1", "Rectangle 2")
- `no-deeply-nested` — flag excessive nesting
- `no-empty-frames` — find empty frames
- `prefer-auto-layout` — suggest auto-layout for manual layouts
- `no-hardcoded-colors` — check that variables are used
- `color-contrast` — WCAG AA/AAA compliance
- `touch-target-size` — minimum 44×44 interactive targets
- `min-text-size` — minimum 12px text

### Export

Export designs for development:

```bash
# Export as PNG (2x for retina)
node tools/figma-cli/src/index.js export <nodeId> --format png --scale 2

# Export as SVG
node tools/figma-cli/src/index.js export <nodeId> --format svg

# Export as React JSX
node tools/figma-cli/src/index.js export <nodeId> --format jsx

# Export as Storybook story
node tools/figma-cli/src/index.js export <nodeId> --format storybook
```

### Creating Elements in Figma

Build designs programmatically:

```bash
# Create a frame with auto-layout
node tools/figma-cli/src/index.js create frame "Card" --width 320 --height 200 --autolayout column --gap 16 --padding 24

# Create text
node tools/figma-cli/src/index.js create text "Hello World" --font "Inter" --size 16 --weight 400

# Insert an icon (150k+ from Iconify)
node tools/figma-cli/src/index.js create icon "lucide:arrow-right" --size 24

# Create a component from a frame
node tools/figma-cli/src/index.js create component <frameId>
```

### Batch Operations

```bash
# Batch rename layers
node tools/figma-cli/src/index.js batch-rename "icon/*" --pattern "{name}-{n}"

# Find and replace text
node tools/figma-cli/src/index.js find-replace "Lorem ipsum" "Card description"

# Case conversion
node tools/figma-cli/src/index.js batch-rename --case kebab
```

## Integration with Design System Workflow

When using figma-cli alongside this design system starter kit, follow this pattern:

1. **Analyze first** — Run `analyze colors`, `analyze typography`, `analyze spacing` to understand the Figma file
2. **Lint** — Run `lint` to catch a11y issues at the design level
3. **Extract tokens** — Export variables and map to `packages/tokens/src/`
4. **Build tokens** — `pnpm --filter @vcds/tokens build`
5. **Inspect components** — Use `inspect` and `tree` to read component structure
6. **Generate code** — Use blueprints in `/blueprints/` as structural templates, populate with Figma data
7. **Export assets** — Export icons as SVG, images as PNG
8. **Verify** — Compare coded output against Figma using visual diff

## Important Safety Rules

- **ALWAYS work on a duplicate Figma file or branch** when using write commands
- **NEVER run write commands on a shared production file** without team consensus
- Check that Figma Desktop is open with the correct file before running commands
- If connection drops, re-run the connect command
- Yolo Mode patch may need reapplying after Figma Desktop updates
