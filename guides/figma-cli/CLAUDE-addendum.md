# CLAUDE.md / AGENTS.md — Figma Desktop CLI Addendum

> Append this section to the main CLAUDE.md or AGENTS.md if the user has installed figma-cli.

## Figma Desktop CLI (Optional)

If `tools/figma-cli/` exists, this project has the Figma Desktop CLI installed. It gives you direct read/write access to Figma Desktop via Chrome DevTools Protocol.

### Before Using figma-cli

1. Check connection: `node tools/figma-cli/src/index.js status`
2. If not connected, tell the user to run the connect command first
3. **NEVER run write commands on a shared production Figma file** — always confirm with the user

### Key Commands for Design System Work

```bash
# Analyze the Figma file
node tools/figma-cli/src/index.js analyze colors
node tools/figma-cli/src/index.js analyze typography
node tools/figma-cli/src/index.js analyze spacing

# Lint for accessibility
node tools/figma-cli/src/index.js lint

# Extract variables
node tools/figma-cli/src/index.js variables list
node tools/figma-cli/src/index.js variables export --format css

# Inspect components
node tools/figma-cli/src/index.js find "Button"
node tools/figma-cli/src/index.js inspect <nodeId>

# Export
node tools/figma-cli/src/index.js export <nodeId> --format jsx
node tools/figma-cli/src/index.js export <nodeId> --format storybook
```

### Integration Pattern

When the user asks to build a component from Figma:

1. Use `analyze` commands to understand the design context
2. Use `find` + `inspect` to read the specific component
3. Use `lint --rules color-contrast` to verify a11y in the design
4. Map Figma values to tokens in `packages/tokens/src/`
5. Generate component code using blueprints in `/blueprints/`
6. Build tokens if new ones were added: `pnpm --filter @vcds/tokens build`

### Safety

- ALWAYS ask the user before running write commands (create, modify, delete)
- ALWAYS suggest working on a duplicate file first
- Reference `skills/figma-cli.md` for the full command reference
