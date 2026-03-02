# Figma Desktop CLI Integration

> Claude Code & OpenCode option for direct Figma Desktop control.

## Quick Setup

```bash
node scripts/setup-figma-cli.js
```

The interactive setup will:
1. Confirm you're using Claude Code or OpenCode
2. Show risk disclosure and ask for acceptance
3. Let you choose Safe Mode or Yolo Mode
4. Clone and install figma-cli

## Files

| File | Purpose |
|------|---------|
| `scripts/setup-figma-cli.js` | Interactive setup script |
| `guides/figma-setup.md` | Full guide (Option B section) |
| `skills/figma-cli.md` | Agent skill — teaches Claude Code the commands |
| `guides/figma-cli/CLAUDE-addendum.md` | Additional CLAUDE.md / AGENTS.md context for figma-cli |
| `tools/figma-cli/` | Clone location (gitignored) |

## After Setup

Start Claude Code (`claude`) or OpenCode (`opencode`) from the repo root and just talk about your Figma designs:

```
"Analyze the colors in my Figma file and map them to our token primitives"
"Lint the current page for accessibility issues"
"Create a variable collection for our semantic colors with Light and Dark modes"
```

## More Info

- [figma-cli GitHub](https://github.com/silships/figma-cli) — by Sil Bormüller
- [Full setup guide](../figma-setup.md) — Option B section
- [Blog post](https://www.intodesignsystems.com/blog/claude-code-figma-no-mcp) — Background and motivation
