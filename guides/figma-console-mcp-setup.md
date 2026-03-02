# Figma Console MCP — Complete Setup Guide

> This guide walks you through connecting Figma Console MCP to your AI coding
> agent. If you ran `npm run init`, your `.mcp.json` is already configured —
> this guide covers the remaining steps to get everything working.

---

## What You'll Get

Figma Console MCP gives your AI agent **56+ tools** to work with your Figma files:

- **Extract design tokens** as CSS, Sass, Tailwind, or JSON
- **Read component specs** — properties, variants, spacing, typography
- **Create and modify designs** programmatically
- **Manage variables** — create collections, set values, switch modes
- **Take screenshots** of any frame or component
- **Debug plugins** with real-time console access

---

## Prerequisites

Before starting, make sure you have:

- [ ] A **Figma account** (free plan works)
- [ ] **Figma Desktop** app installed — [download here](https://www.figma.com/downloads/)
  - The browser version of Figma won't work — you need the desktop app
- [ ] An **MCP-compatible IDE** (Cursor, Claude Code, Windsurf, VS Code, etc.)
- [ ] **Node.js 18+** installed — check with `node --version`

---

## Step 1: Get a Figma Personal Access Token

Your AI agent needs a token to access the Figma API.

1. Open **Figma Desktop** (or figma.com) → click your **profile icon** (top-left) → **Settings**
2. Go to the **Security** tab
3. Scroll to **"Personal access tokens"** → click **Generate new token**
4. Give it a name — something like "Design System MCP" so you remember what it's for
5. **Copy the token immediately** — Figma only shows it once. If you lose it, you'll need to generate a new one
6. The token starts with `figd_`

> **Already entered your token during `npm run init`?** Skip to Step 2 — your
> `.mcp.json` is already configured.

### Adding the token later

If you skipped Figma during init, or need to update your token, open `.mcp.json`
at the repo root and replace `YOUR_FIGMA_TOKEN_HERE`:

```json
{
  "mcpServers": {
    "figma-console": {
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_actual_token_here"
      }
    }
  }
}
```

---

## Step 2: Verify Your `.mcp.json`

If you ran `npm run init` and chose "Figma Console MCP", your `.mcp.json` should
look like this:

```json
{
  "mcpServers": {
    "figma-console": {
      "command": "npx",
      "args": ["-y", "figma-console-mcp@latest"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_your_token_here",
        "ENABLE_MCP_APPS": "true"
      }
    }
  }
}
```

**Check these three things:**
1. The `figma-console` server entry exists
2. Your token is filled in (not `YOUR_FIGMA_TOKEN_HERE`)
3. `ENABLE_MCP_APPS` is set to `"true"`

---

## Step 3: Install the Desktop Bridge Plugin

This is the step most people miss. Without the Desktop Bridge plugin, you only
get REST API access (~21 tools). With it, you unlock the **full 56+ tool set**
including design creation, variable management, and live screenshots.

### 3a. Find the plugin files

Run this command in your terminal:

```bash
npx figma-console-mcp@latest --print-path
```

This prints the path to the plugin directory. Make note of it — you'll need it
in the next step.

### 3b. Import the plugin into Figma

1. **Open Figma Desktop** (not the browser)
2. Open any design file
3. **Right-click** anywhere on the canvas
4. Navigate to **Plugins > Development > Import plugin from manifest...**
5. Navigate to the path from step 3a
6. Select the `manifest.json` file inside the `figma-desktop-bridge` folder
7. Click **"Open"**

The plugin now appears in your Development plugins list.

### 3c. Run the plugin

1. **Right-click** on the canvas again
2. Go to **Plugins > Development > Figma Desktop Bridge**
3. A small plugin window opens
4. Look for the **"Connected"** indicator — this means the WebSocket connection
   between Figma and the MCP server is active

> **Important:** You need to run the Desktop Bridge plugin each time you open
> Figma. It doesn't auto-start. Just right-click > Plugins > Development >
> Figma Desktop Bridge.

---

## Step 4: Restart Your IDE

Most IDEs need a restart to pick up MCP server changes:

| IDE | How to restart |
|-----|---------------|
| **Cursor** | `Cmd/Ctrl+Shift+P` > "Reload Window", or quit and reopen |
| **Claude Code** | Close and reopen the terminal session |
| **Windsurf** | Quit and reopen Windsurf |
| **VS Code (Copilot)** | `Cmd/Ctrl+Shift+P` > "Reload Window" |
| **OpenCode** | Close and reopen the terminal session |

---

## Step 5: Test the Connection

### Quick test

Ask your AI agent:

```
What Figma tools do you have available? List a few.
```

If connected, the agent should mention tools like `figma_get_variables`,
`figma_execute`, `figma_get_component`, `figma_capture_screenshot`, etc.

### Real test

Try extracting data from a Figma file:

```
Get a summary of the design system in this Figma file: [paste your file URL]
```

Or try creating something:

```
Create a simple 200x100 frame in Figma with a blue background.
```

If the creation test works, you have full read/write access.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent says "no Figma tools available" | Check `.mcp.json` exists at repo root with the `figma-console` entry. Restart your IDE. |
| "Token expired" or authentication error | Generate a new token (Figma Settings → Security → Personal access tokens) and update `.mcp.json` |
| Only ~21 tools available (not 56+) | Install and run the Desktop Bridge Plugin (Step 3). It must be running in Figma Desktop. |
| Desktop Bridge shows "Disconnected" | Close the plugin window and reopen it: right-click > Plugins > Development > Figma Desktop Bridge |
| Plugin not appearing in Development menu | Re-import the manifest (Step 3b). Make sure you're using Figma Desktop, not the browser. |
| `npx figma-console-mcp@latest --print-path` fails | Make sure Node.js 18+ is installed. Run `node --version` to check. |
| Port conflict error | Update to the latest version (`npx figma-console-mcp@latest`). Re-import the Desktop Bridge plugin manifest. Versions 1.10.0+ auto-scan ports 9223-9232. |
| Works in one file but not another | Run the Desktop Bridge plugin in each Figma file you want to access. The plugin is per-file, not global. |

---

## How It Works (Under the Hood)

```
Your IDE                 MCP Server              Figma Desktop
─────────                ──────────              ─────────────
AI agent request   →   figma-console-mcp    →   REST API (read)
                                              +
                                              Desktop Bridge Plugin
                                              (WebSocket for write)
```

- **REST API** (always available): Read files, export images, get components
- **Desktop Bridge** (needs plugin): Create/modify designs, manage variables,
  execute plugin code, capture live screenshots

The MCP server handles both connections automatically. When the Desktop Bridge
plugin is running, all 56+ tools are available. Without it, you get the
read-only REST API subset.

---

## Next Steps

- Read the full Figma Console MCP docs: https://docs.figma-console-mcp.southleft.com/
- Explore the setup options: https://docs.figma-console-mcp.southleft.com/setup
- See `guides/figma-setup.md` for a comparison of all Figma integration options
