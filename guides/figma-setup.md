# Figma Integration Setup

This guide covers connecting Figma to your vibe coding workflow. There are two integration paths depending on your coding agent.

---

## Choose Your Integration Path

| | **Figma MCP Servers** | **Figma Desktop CLI** |
|---|---|---|
| **Works with** | All IDEs (Cursor, Claude Code, Windsurf, Copilot, Antigravity, OpenCode) | Claude Code and OpenCode only |
| **Access type** | Read-only (API) | Read + Write (local) |
| **Requires** | Figma access token (API key) | Figma Desktop app |
| **Figma account** | Any plan | Free plan works |
| **Best for** | Inspecting designs, extracting values, code generation | Full design system automation, batch ops, linting, token creation in Figma |

**Using Cursor, Windsurf, Copilot, or Antigravity?** → Go to [Option A: MCP Servers](#option-a-figma-mcp-servers-all-ides)

**Using Claude Code or OpenCode?** → You can use Option A, or also consider [Option B: Figma Desktop CLI](#option-b-figma-desktop-cli-claude-code--opencode-only) for a more powerful local workflow. You can use both together.

---

## Option A: Figma MCP Servers (All IDEs)

### 1. Get a Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/settings)
2. Scroll to **Personal access tokens**
3. Click **Generate new token**
4. Give it a descriptive name (e.g., "Design System MCP")
5. Copy the token — you'll need it for both MCP servers

### 2. Configure MCP Servers

The `.mcp.json` at the repo root is pre-configured. Replace the placeholder tokens:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic/figma-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "paste-your-token-here"
      }
    },
    "figma-console": {
      "command": "npx",
      "args": ["-y", "@anthropic/figma-console-mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "paste-your-token-here"
      }
    }
  }
}
```

> **Security tip:** Consider using environment variables instead of pasting tokens directly. Create a `.env.local` file (already in `.gitignore`) and reference the variable.

### 3. Figma MCP — Design-to-Code

The Figma MCP server lets your AI agent read Figma files and translate designs into code.

**What it can do:**
- Read component designs from Figma frames
- Extract colors, spacing, typography, and layout information
- Understand auto-layout, constraints, and variants
- Generate component code matching the Figma design

**Example prompts:**

```
Read the Button component in this Figma file: [paste Figma URL]
Generate a React component matching this design, using our design tokens.
```

```
Look at the Card component in Figma and compare it to our current
implementation in packages/react/src/components/Card/.
List any visual differences.
```

### 4. Figma Console MCP — Debug and Inspect

The Figma Console MCP provides deeper inspection capabilities.

**What it can do:**
- List all pages and frames in a Figma file
- Inspect specific nodes for detailed properties
- Read component sets and their variants
- Extract exact style values (fills, strokes, effects, text properties)

**Example prompts:**

```
List all components in this Figma file: [paste URL]
```

```
Inspect the "Primary/Large" variant of the Button component.
What are its exact padding, border-radius, and font properties?
```

---

## Option B: Figma Desktop CLI (Claude Code & OpenCode Only)

> **This option is only available if you are using Claude Code or OpenCode as your coding agent.**

The [figma-cli](https://github.com/silships/figma-cli) by Sil Bormüller connects directly to Figma Desktop via Chrome DevTools Protocol (CDP), giving Claude Code full read/write access to your Figma files — no API key required.

### Why Consider This?

- **No API key needed** — uses your existing Figma Desktop session
- **Read AND write** — create variables, components, frames, and text directly in Figma
- **Batch operations** — create 100 variables at once, batch rename layers, find/replace text
- **Design linting** — WCAG contrast checking, touch targets, naming rules, nesting depth
- **Design analysis** — scan colors, typography, spacing, and detect repeated patterns
- **Export** — PNG, SVG, JSX, Storybook stories, CSS variables, Tailwind config
- **Free Figma account works** — no paid plan required
- **Fewer tokens consumed** — local connection, no API round-trips

### ⚠️ Risks — Read Before Proceeding

Before setting up the Figma Desktop CLI, you must understand and accept these risks:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ⚠️  RISK DISCLOSURE — figma-cli (Figma Desktop CLI)              │
│                                                                     │
│   1. WRITE ACCESS                                                   │
│      Unlike MCP servers which are read-only, this tool can          │
│      CREATE, MODIFY, and DELETE elements in your Figma files.       │
│      There is no undo for programmatic changes. Always work         │
│      on a duplicate file or branch.                                 │
│                                                                     │
│   2. APP MODIFICATION (Yolo Mode only)                              │
│      Yolo Mode patches the Figma Desktop binary to enable           │
│      a debug port. This modifies files inside the Figma.app         │
│      bundle. A Figma update may overwrite the patch, and it         │
│      may conflict with Figma's terms of service.                    │
│                                                                     │
│   3. LOCAL PORT EXPOSURE                                            │
│      The debug connection runs on localhost. While not exposed       │
│      to the network, any local process could theoretically           │
│      connect to the debug port while it's active.                   │
│                                                                     │
│   4. EARLY-STAGE TOOL                                               │
│      This is a community project (MIT license) with limited         │
│      contributors. It may break with Figma updates and there        │
│      are no guarantees of continued maintenance.                    │
│                                                                     │
│   5. CORPORATE ENVIRONMENTS                                         │
│      If your organization manages Figma licenses or has             │
│      security policies, check with your IT team before              │
│      modifying the Figma Desktop app.                               │
│                                                                     │
│   RECOMMENDATION: Start with Safe Mode (plugin-based, no app       │
│   modification). Only use Yolo Mode if Safe Mode doesn't work      │
│   for your setup.                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**By proceeding, you acknowledge these risks and accept responsibility for any changes made to your Figma files or application.**

→ **I accept the risks — continue to [Mode Selection](#choose-your-connection-mode)**
→ **I'd rather not — go back to [Option A: MCP Servers](#option-a-figma-mcp-servers-all-ides)**

---

### Choose Your Connection Mode

There are two modes for connecting to Figma Desktop. Choose based on your comfort level:

#### Mode 1: Safe Mode (Recommended)

**How it works:** Uses a Figma plugin to communicate with the CLI. No modification to the Figma app binary. You install a local plugin and start it each time you open Figma.

**Pros:** No app modification, works reliably, easy to remove.
**Cons:** Requires starting the plugin manually each session.

```bash
# 1. Clone figma-cli into the tools directory
git clone https://github.com/silships/figma-cli.git tools/figma-cli
cd tools/figma-cli
npm install

# 2. Connect to Figma in Safe Mode
node src/index.js connect --safe

# 3. In Figma Desktop:
#    Menu → Plugins → Development → Import plugin from manifest
#    Navigate to: tools/figma-cli/src/figma-plugin/manifest.json
#    Run the plugin

# 4. Start Claude Code from the repo root
cd ../..
claude
```

#### Mode 2: Yolo Mode (Advanced)

**How it works:** Patches the Figma Desktop binary to enable Chrome DevTools remote debugging. This is a one-time modification that persists until Figma updates.

**Pros:** No plugin needed, connects automatically, fastest workflow.
**Cons:** Modifies the Figma app binary, may break on update, may conflict with Figma ToS.

```bash
# 1. Clone figma-cli into the tools directory
git clone https://github.com/silships/figma-cli.git tools/figma-cli
cd tools/figma-cli
npm install

# 2. IMPORTANT: Back up your Figma app first
# macOS:
sudo cp /Applications/Figma.app/Contents/Resources/app.asar ~/app.asar.backup

# 3. Connect to Figma in Yolo Mode (patches Figma automatically)
node src/index.js connect

# 4. Start Claude Code from the repo root
cd ../..
claude
```

**To restore Figma after patching (macOS):**
```bash
sudo cp ~/app.asar.backup /Applications/Figma.app/Contents/Resources/app.asar
sudo codesign --force --deep --sign - /Applications/Figma.app
```

### Platform Notes

| Platform | Yolo Mode | Safe Mode |
|----------|-----------|-----------|
| **macOS** | Fully supported | Fully supported |
| **Windows** | Supported (run as Administrator) | Fully supported |
| **Linux** | Supported | Fully supported |

### Using figma-cli with Claude Code or OpenCode

Once connected, start your agent from the **repo root** (not from the figma-cli folder). Claude Code reads `CLAUDE.md` and OpenCode reads `AGENTS.md` — both include figma-cli context. The CLI's own `CLAUDE.md` teaches the agent all available commands automatically.

**Example prompts:**

```
Create a variable collection called "Semantic Colors" with Light and Dark modes.
Add color-action-primary as #2563EB in Light and #60A5FA in Dark.
```

```
Analyze all colors used in the current page.
Show me which ones don't match our token primitives.
```

```
Lint the current page for accessibility issues.
Check contrast ratios and touch target sizes.
```

```
Export all component variants as PNG at 2x scale.
```

```
Create a Tailwind color palette from our Figma variables.
```

### What figma-cli Can Do (Full Capabilities)

**Design Tokens & Variables:**
Create variable collections, modes (Light/Dark/Mobile), batch create/update variables, bind variables to nodes, export as CSS custom properties or Tailwind config.

**Create & Modify Elements:**
Frames with auto-layout, text, shapes, icons (150k+ from Iconify), components, component sets with variants. Modify fills, strokes, radius, sizing, layout.

**Analysis:**
Color usage analysis, typography audit, spacing analysis, pattern detection (find clusters of repeated elements that should be components).

**Linting & Accessibility:**
8+ built-in rules including WCAG contrast, touch targets, naming conventions, nesting depth, hardcoded colors, empty frames, auto-layout suggestions.

**Export:**
PNG, SVG, JSX (React), Storybook stories, CSS variables, Tailwind config. Multiple scales (@1x, @2x, @3x).

**Team Libraries:**
Import and use components, styles, and variables from shared Figma libraries.

**Batch Operations:**
Rename layers (with patterns), find/replace text, case conversion, lorem ipsum generation, image insertion, Unsplash integration.

---

## Workflow: Figma → Tokens → Components

Regardless of which integration you choose, the recommended workflow is:

1. **Inspect in Figma** — Use Figma Console MCP or figma-cli to extract exact values
2. **Map to tokens** — Match Figma values to existing primitive tokens
3. **Create semantic tokens** — If new semantic mappings are needed, add them
4. **Build tokens** — `pnpm --filter @ds/tokens build`
5. **Generate components** — Use Figma MCP or figma-cli to generate component code
6. **Verify** — Compare the coded component against the Figma design
7. **Test** — Run a11y checks and visual regression tests

## Comparison: When to Use Which

| Task | MCP Servers | figma-cli |
|------|-------------|-----------|
| Read component designs | ✅ | ✅ |
| Extract design token values | ✅ | ✅ |
| Create variables in Figma | ❌ | ✅ |
| Batch rename layers | ❌ | ✅ |
| Lint designs for a11y | ❌ | ✅ |
| Export to JSX/Storybook | ❌ | ✅ |
| Analyze color/type usage | ❌ | ✅ |
| Works in browser Figma | ✅ | ❌ |
| Works without Desktop app | ✅ | ❌ |
| No app modification needed | ✅ | ✅ (Safe Mode) |
| Works with all IDEs | ✅ | ❌ (Claude Code & OpenCode only) |

**Power users on Claude Code or OpenCode:** Use both. MCP servers for quick reads and URL-based queries, figma-cli for batch operations, linting, and write access.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Token expired" (MCP) | Generate a new token in Figma settings |
| MCP not connecting | Ensure `.mcp.json` is at the repo root |
| "File not found" (MCP) | Check the Figma URL format — use the full URL with file key |
| Slow responses (MCP) | Large Figma files may take time; try targeting specific frames |
| figma-cli can't connect | Make sure Figma Desktop is open with a design file (not home screen) |
| figma-cli permission error (Win) | Run terminal as Administrator |
| Yolo Mode broke after update | Re-run `node src/index.js connect` — it will re-patch |
| Plugin not appearing (Safe Mode) | Re-import the manifest from `tools/figma-cli/src/figma-plugin/manifest.json` |
