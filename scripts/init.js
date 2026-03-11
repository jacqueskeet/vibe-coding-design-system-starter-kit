#!/usr/bin/env node

/**
 * init.js — Post-clone onboarding CLI for the Design System Starter Kit.
 *
 * Usage:
 *   git clone <repo> my-design-system
 *   cd my-design-system
 *   npm run init
 *
 * This is NOT a scaffolder. The repo IS the template.
 * The CLI configures it in-place: naming, prefix, frameworks, Figma, IDE.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

// Local lib imports — these only use Node builtins, safe without npm install
import { validatePrefix, applyPrefix, propagatePrefix } from './lib/prefix.js';
import {
  pruneFrameworks,
  cleanupAgentConfigs,
  cleanupReadme,
  cleanupCursorRules,
  pruneIdeConfigs,
} from './lib/prune.js';
import { configureMcp, configureCodexMcp } from './lib/mcp.js';
import { runSetup } from './lib/build-runner.js';
import {
  buildHeadlessChoices,
  installHeadlessLib,
  pruneHeadlessGuides,
} from './lib/headless.js';
import {
  readWorkspaceYaml,
  writeWorkspaceYaml,
  writeDefaultWorkspaceYaml,
  isDefaultWorkspace,
  buildWorkspacePackageList,
  CORE_PACKAGES,
} from './lib/workspace.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MARKER_PATH = resolve(ROOT, '.ds-initialized');

// ─── Pre-flight checks ─────────────────────────────────────────
// These run before anything else, using only Node builtins.

function preflightChecks() {
  // 1. Node.js version (must be ≥20)
  const nodeVersion = process.versions.node;
  const nodeMajor = parseInt(nodeVersion.split('.')[0], 10);

  if (nodeMajor < 20) {
    console.log();
    console.log('  ┌───────────────────────────────────────────────────┐');
    console.log('  │                                                   │');
    console.log('  │   Node.js 20 or later is required.                │');
    console.log(`  │   You have: v${nodeVersion.padEnd(38)}│`);
    console.log('  │                                                   │');
    console.log('  │   Download the latest LTS version:                │');
    console.log('  │   https://nodejs.org                              │');
    console.log('  │                                                   │');
    console.log('  └───────────────────────────────────────────────────┘');
    console.log();
    process.exit(1);
  }

  // 2. pnpm availability
  const pnpmCheck = spawnSync('pnpm', ['--version'], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (pnpmCheck.status !== 0 || pnpmCheck.error) {
    console.log();
    console.log('  ┌───────────────────────────────────────────────────┐');
    console.log('  │                                                   │');
    console.log('  │   pnpm is required but not installed.             │');
    console.log('  │                                                   │');
    console.log('  │   Install it with:                                │');
    console.log('  │     npm install -g pnpm@9                         │');
    console.log('  │                                                   │');
    console.log('  │   Or use corepack (built into Node 20+):          │');
    console.log('  │     corepack enable                               │');
    console.log('  │                                                   │');
    console.log('  └───────────────────────────────────────────────────┘');
    console.log();
    process.exit(1);
  }

  // 3. pnpm version (warn if <9, not fatal)
  const pnpmVersion = (pnpmCheck.stdout || '').trim();
  const pnpmMajor = parseInt(pnpmVersion.split('.')[0], 10);
  if (pnpmMajor < 9) {
    console.log(
      `\n  ⚠  pnpm 9+ is recommended. You have v${pnpmVersion}.`
    );
    console.log('  Upgrade with: npm install -g pnpm@9\n');
  }
}

preflightChecks();

// ─── Crash recovery ─────────────────────────────────────────────
// If a previous init run crashed after restricting pnpm-workspace.yaml
// but before completing, the workspace will be in a restricted state.
// Detect and restore to avoid a broken workspace.
if (!isDefaultWorkspace(ROOT) && !existsSync(MARKER_PATH)) {
  console.log('  Detected incomplete previous init. Restoring workspace config...\n');
  writeDefaultWorkspaceYaml(ROOT);
}

// ─── Bootstrap: install core deps if needed ─────────────────────
// Only installs core workspace packages (tokens, css, shared, html)
// to get @inquirer/prompts. Framework packages are added later based
// on the user's selection — this avoids downloading React, Vue, and
// Svelte deps when the user may not need them.
if (!existsSync(resolve(ROOT, 'node_modules', '@inquirer', 'prompts'))) {
  console.log('\n  📦 First run — installing core dependencies...\n');

  // Save original workspace config for crash recovery
  const originalWorkspace = readWorkspaceYaml(ROOT);

  // Restrict workspace to core packages only
  writeWorkspaceYaml(ROOT, CORE_PACKAGES);

  const r = spawnSync('pnpm', ['install', '--no-frozen-lockfile'], {
    cwd: ROOT,
    stdio: 'inherit',
  });

  if (r.status !== 0) {
    // Restore original workspace.yaml so the repo isn't left restricted
    if (originalWorkspace !== null) {
      writeFileSync(
        resolve(ROOT, 'pnpm-workspace.yaml'),
        originalWorkspace,
        'utf-8'
      );
    }
    console.error('\n  ✗ Failed to install dependencies.');
    console.error('  Run "pnpm install" manually, then re-run this script.\n');
    process.exit(1);
  }
  console.log();
}

const { input, select, checkbox, password, confirm } = await import('@inquirer/prompts');

const ALL_JS_FWS = ['react', 'vue', 'svelte', 'angular'];

// ─── Helpers ──────────────────────────────────────────────────────

function toKebab(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function derivePrefix(name) {
  const words = name.trim().toLowerCase().split(/\s+/);
  // Try first word (strip non-alphanum)
  const first = words[0].replace(/[^a-z0-9-]/g, '');
  if (first && validatePrefix(first) === null) return first;
  // Try concatenating first two words
  const two = ((words[0] || '') + (words[1] || '')).replace(/[^a-z0-9]/g, '');
  if (two && validatePrefix(two) === null) return two;
  return 'ds';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Banner ───────────────────────────────────────────────────────

function printBanner() {
  const lines = [
    'Design System Starter Kit',
    "Let's set up your design system.",
  ];
  const width = Math.max(...lines.map((l) => l.length));
  const border = '─'.repeat(width + 4);
  console.log(`\n┌─${border}─┐`);
  for (const line of lines) {
    console.log(`│  ${line.padEnd(width + 2)} │`);
  }
  console.log(`└─${border}─┘\n`);
}

// ─── Idempotency check ───────────────────────────────────────────

async function checkIdempotency() {
  if (!existsSync(MARKER_PATH)) return;

  try {
    const marker = JSON.parse(readFileSync(MARKER_PATH, 'utf-8'));
    console.log(
      `  ⚠  This repo was already initialized on ${marker.date?.split('T')[0] || 'unknown date'}.`
    );
    console.log(
      `  Previous config: prefix="${marker.prefix}", name="${marker.name}"\n`
    );
  } catch {
    console.log('  ⚠  This repo was already initialized.\n');
  }

  const proceed = await confirm({
    message: 'Re-running will overwrite previous configuration. Continue?',
    default: false,
  });

  if (!proceed) {
    console.log('\n  Aborted. No changes made.\n');
    process.exit(0);
  }

  console.log();
}

// ─── Prompts ──────────────────────────────────────────────────────

async function gatherAnswers() {
  // 1. Name
  console.log('  Your design system name appears in config files, documentation,');
  console.log('  and the README. You can always change it later.\n');

  const name = await input({
    message: "What's your design system called?",
    default: 'Design System',
    validate: (v) => (v.trim().length > 0 ? true : 'Name is required'),
  });

  // 2. Prefix
  console.log('\n  The prefix appears in every CSS class and custom property.');
  console.log('  Keep it short (2-5 chars). Must start with a letter.\n');

  const defaultPrefix = derivePrefix(name);
  const prefix = await input({
    message: 'Choose a class prefix (e.g., acme, myds)',
    default: defaultPrefix,
    validate: (v) => {
      const err = validatePrefix(v);
      return err === null ? true : err;
    },
  });
  console.log(
    `\n  Preview: .${prefix}-button, --${prefix}-color-action-primary\n`
  );

  // 3. Frameworks
  console.log('  All frameworks share the same CSS component base layer.');
  console.log('  Deselecting a framework removes its package and blueprints.\n');

  const frameworks = await checkbox({
    message: 'Which frameworks do you need? (space to toggle)',
    choices: [
      {
        name: 'React',
        value: 'react',
        checked: true,
        description: 'TypeScript components with tests and Storybook stories',
      },
      {
        name: 'Vue',
        value: 'vue',
        checked: true,
        description: 'Vue 3 Composition API with TypeScript',
      },
      {
        name: 'Svelte',
        value: 'svelte',
        checked: true,
        description: 'Svelte 5 components with TypeScript',
      },
      {
        name: 'Angular',
        value: 'angular',
        checked: true,
        description: 'Angular 17+ standalone components with TypeScript',
      },
      {
        name: 'HTML/CSS only (always included)',
        value: 'html',
        disabled: '(always included)',
      },
    ],
  });

  // 4. Headless UI library (optional)
  const selectedFwsForHeadless = frameworks.filter((f) => ALL_JS_FWS.includes(f));
  const headlessChoices = buildHeadlessChoices(selectedFwsForHeadless);

  console.log('\n  Headless libraries provide behavior primitives (keyboard nav, ARIA,');
  console.log('  focus management). Your design tokens handle all visual styling.');
  console.log('  Choose "None" to skip — integration guides are kept for reference.\n');

  const headlessLib = await select({
    message: 'Headless UI library (optional)',
    choices: headlessChoices,
  });

  // 5. IDE (asked before Figma so we can show DS CLI for Claude/OpenCode)
  console.log('\n  Your IDE choice determines which agent config files to keep.');
  console.log('  Unused IDE configs are removed to keep the project clean.');
  console.log('  Choose "Other / multiple" to keep all configs.\n');

  const ide = await select({
    message: 'Which IDE will you primarily use?',
    choices: [
      {
        name: 'Cursor',
        value: 'cursor',
        description: 'Reads .cursor/rules/ — 3 rule files for design system context',
      },
      {
        name: 'Cursor + Claude Code',
        value: 'cursor-claude',
        description: 'Both .cursor/rules/ and CLAUDE.md are read — full coverage',
      },
      {
        name: 'Claude Code',
        value: 'claude',
        description: 'Reads CLAUDE.md — full system context in every prompt',
      },
      {
        name: 'Windsurf',
        value: 'windsurf',
        description: 'Reads .windsurfrules — Cascade gets design system conventions',
      },
      {
        name: 'VS Code (Copilot)',
        value: 'copilot',
        description: 'Reads .github/copilot-instructions.md',
      },
      {
        name: 'Google Antigravity',
        value: 'antigravity',
        description: 'Reads .antigravity/rules.md',
      },
      {
        name: 'OpenCode',
        value: 'opencode',
        description: 'Reads AGENTS.md — build and plan agents follow conventions',
      },
      {
        name: 'OpenAI Codex',
        value: 'codex',
        description: 'Reads AGENTS.md — project rules and .codex/config.toml for MCP',
      },
      {
        name: 'Other / multiple',
        value: 'other',
        description: 'All config files included — works with any IDE',
      },
    ],
  });

  // 5. Figma
  console.log('\n  Figma integration lets AI agents read your designs directly.');
  console.log('  MCP options need a Figma account and Personal Access Token.\n');

  const supportsCliIntegration = ide === 'claude' || ide === 'opencode' || ide === 'cursor-claude' || ide === 'codex';
  const figmaChoices = [
    {
      name: 'Figma Console MCP (recommended — 56+ tools)',
      value: 'console',
      description: 'Full read/write — extract tokens, create components, debug plugins. Needs Desktop Bridge plugin.',
    },
    {
      name: 'Figma Dev Mode MCP (official — read-only)',
      value: 'devmode',
      description: 'Read-only — generate code from Figma designs. No plugin needed.',
    },
  ];

  if (supportsCliIntegration) {
    figmaChoices.push({
      name: 'Figma DS CLI (direct Desktop access)',
      value: 'cli',
      description: 'Read/write via Chrome DevTools Protocol. Clones silships/figma-cli into tools/.',
    });
  }

  figmaChoices.push({
    name: 'Skip for now',
    value: 'skip',
    description: 'You can configure this later in .mcp.json',
  });

  const figma = await select({
    message: 'Set up Figma integration?',
    choices: figmaChoices,
    default: 'skip',
  });

  let figmaToken = null;
  if (figma !== 'skip' && figma !== 'cli') {
    console.log('\n  How to get your token:');
    console.log('    1. Open Figma → click your profile icon (top-left) → Settings');
    console.log('    2. Go to the Security tab');
    console.log('    3. Scroll to "Personal access tokens" → Generate new token');
    console.log('    4. Name it (e.g., "Design System MCP")');
    console.log('    5. Copy immediately — it won\'t be shown again\n');

    figmaToken = await password({
      message: 'Figma Personal Access Token:',
      mask: '*',
      validate: (v) =>
        v.trim().length > 0 ? true : 'Token is required (or re-run and choose Skip)',
    });
  }

  return { name, prefix, frameworks, headlessLib, figma, figmaToken, ide };
}

// ─── Confirmation summary ─────────────────────────────────────────

function printSummary(answers) {
  const { name, prefix, frameworks, headlessLib, figma, ide } = answers;
  const selectedFws = frameworks.filter((f) => ALL_JS_FWS.includes(f));
  const removingAll = selectedFws.length === 0;

  const fwLabel = selectedFws.length
    ? selectedFws.map(capitalize).join(', ') + ', HTML/CSS'
    : 'HTML/CSS only';

  const headlessLabels = {
    radix: 'Radix UI',
    'base-ui': 'Base UI',
    'headless-ui': 'Headless UI',
    'ark-ui': 'Ark UI',
    'angular-primitives': 'Angular Primitives',
    zag: 'Zag.js',
    none: 'None',
  };

  const figmaLabels = {
    console: 'Console MCP',
    devmode: 'Dev Mode MCP',
    cli: 'DS CLI (direct Desktop access)',
    skip: 'Skip for now',
  };

  const ideLabels = {
    cursor: 'Cursor',
    'cursor-claude': 'Cursor + Claude Code',
    claude: 'Claude Code',
    windsurf: 'Windsurf',
    copilot: 'VS Code (Copilot)',
    antigravity: 'Google Antigravity',
    opencode: 'OpenCode',
    other: 'Other / multiple',
  };

  console.log('\n  ─────────────────────────────────');
  console.log(`  Design system:  ${name}`);
  console.log(`  Prefix:         ${prefix}`);
  console.log(`  Frameworks:     ${fwLabel}`);
  console.log(`  Headless UI:    ${headlessLabels[headlessLib] || headlessLib}`);
  if (removingAll) {
    console.log(
      '  Note:           Storybook will be removed (requires React)'
    );
  }
  console.log(`  IDE:            ${ideLabels[ide] || ide}`);
  console.log(`  Figma:          ${figmaLabels[figma]}`);
  console.log('  ─────────────────────────────────\n');
}

// ─── Execute ──────────────────────────────────────────────────────

async function execute(answers) {
  const { name, prefix, frameworks, headlessLib, figma, figmaToken, ide } = answers;
  const selectedFws = frameworks.filter((f) => ALL_JS_FWS.includes(f));
  const toRemove = ALL_JS_FWS.filter((f) => !selectedFws.includes(f));
  const removingAll = selectedFws.length === 0;

  // ── Phase A: Configure files ──────────────────────────────────
  console.log('\n  Configuring...\n');

  try {
    // A1. Update ds.config.json — name + description + prefix
    const configPath = resolve(ROOT, 'ds.config.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    const oldPrefix = config.prefix; // Capture BEFORE overwriting
    config.name = name;
    config.description = `${name} — built with the Design System Starter Kit`;
    config.prefix = prefix;
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    console.log('  ✓ ds.config.json');

    // A2. Apply prefix to SCSS + TS config files
    applyPrefix(prefix, ROOT);
    console.log(`  ✓ Prefix: ${prefix}`);

    // A2b. Propagate prefix across all text files (HTML, docs, agent configs, etc.)
    const prefixLog = propagatePrefix(oldPrefix, prefix, ROOT);
    if (prefixLog.length > 0) {
      console.log(`  ✓ Updated prefix in ${prefixLog.length} files`);
    }

    // A3. Update root package.json — name + description
    const pkgPath = resolve(ROOT, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    pkg.name = toKebab(name);
    pkg.description = `${name} — built with the Design System Starter Kit`;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    console.log('  ✓ package.json');

    // A4. Update README.md — title + tagline
    const readmePath = resolve(ROOT, 'README.md');
    if (existsSync(readmePath)) {
      let readme = readFileSync(readmePath, 'utf-8');
      readme = readme.replace(/^#\s+[^\n]+/, `# ${name}`);
      readme = readme.replace(
        /^>\s+A vibe coding[^\n]*/m,
        `> ${name} — AI-ready design system built with the Design System Starter Kit.`
      );
      writeFileSync(readmePath, readme, 'utf-8');
      console.log('  ✓ README.md');
    }

    // A5. Configure .mcp.json
    // DS CLI doesn't use MCP servers — treat same as 'skip' for .mcp.json
    configureMcp(figma === 'cli' ? 'skip' : figma, figmaToken, ROOT, removingAll);
    console.log('  ✓ .mcp.json');

    // A6. Configure .codex/config.toml (only when Codex is the selected IDE)
    if (ide === 'codex') {
      configureCodexMcp(figma === 'cli' ? 'skip' : figma, figmaToken, ROOT, removingAll);
      console.log('  ✓ .codex/config.toml');
    }
  } catch (err) {
    console.error(`\n  ✗ Configuration failed: ${err.message}`);
    console.error(
      '  The repo is still in a usable state. Try running init again.\n'
    );
    process.exit(1);
  }

  // ── Phase B: Prune unused frameworks ──────────────────────────
  if (toRemove.length > 0) {
    console.log('\n  Pruning unused frameworks...\n');
    try {
      // B1. Remove directories, guides, update package.json + vitest
      const pruneLog = pruneFrameworks(toRemove, ROOT);
      for (const entry of pruneLog) console.log(`  ✓ ${entry}`);

      // B2. Clean up README (packages, architecture, repo structure, integration table)
      const readmeLog = cleanupReadme(toRemove, ROOT);
      for (const entry of readmeLog) console.log(`  ✓ ${entry}`);

      // B3. Clean up Cursor rules (globs, framework examples)
      const cursorLog = cleanupCursorRules(toRemove, ROOT);
      for (const entry of cursorLog) console.log(`  ✓ ${entry}`);

      // B4. Best-effort agent config cleanup (CLAUDE.md, AGENTS.md, etc.)
      const configLog = cleanupAgentConfigs(toRemove, ROOT);
      for (const entry of configLog) console.log(`  ✓ ${entry}`);
    } catch (err) {
      console.error(
        `\n  ⚠  Framework pruning partially failed: ${err.message}`
      );
      console.error(
        '  You may need to manually remove unused packages.\n'
      );
    }
  }

  // ── Phase B2: Prune unused IDE configs ──────────────────────────
  if (ide !== 'other') {
    console.log('\n  Cleaning up IDE configs...\n');
    try {
      const ideLog = pruneIdeConfigs(ide, ROOT);
      for (const entry of ideLog) console.log(`  ✓ ${entry}`);
      if (ideLog.length === 0) console.log('  ✓ No unused IDE configs to remove');
    } catch (err) {
      console.error(`\n  ⚠  IDE config cleanup partially failed: ${err.message}`);
    }
  }

  // ── Phase B3: Headless UI library ────────────────────────────────
  if (headlessLib !== 'none') {
    console.log('\n  Setting up headless UI library...\n');
    try {
      const headlessLog = installHeadlessLib(headlessLib, selectedFws, ROOT);
      for (const entry of headlessLog) console.log(`  ✓ ${entry}`);

      const guideLog = pruneHeadlessGuides(headlessLib, ROOT);
      for (const entry of guideLog) console.log(`  ✓ ${entry}`);
    } catch (err) {
      console.error(`\n  ⚠  Headless library setup partially failed: ${err.message}`);
    }
  }

  // ── Phase B4: Update workspace to match selected frameworks ────
  const finalPackages = buildWorkspacePackageList(selectedFws);
  try {
    writeWorkspaceYaml(ROOT, finalPackages);
    console.log('\n  ✓ pnpm-workspace.yaml (filtered to selected frameworks)');
  } catch (err) {
    console.error(`\n  ⚠  Failed to update pnpm-workspace.yaml: ${err.message}`);
    console.error('  You may need to manually edit pnpm-workspace.yaml.\n');
  }

  // ── Write .ds-initialized marker ──────────────────────────────
  const marker = {
    date: new Date().toISOString(),
    name,
    prefix,
    frameworks: selectedFws,
    headlessLib,
    figma,
    ide,
    workspacePackages: finalPackages,
  };
  writeFileSync(MARKER_PATH, JSON.stringify(marker, null, 2) + '\n', 'utf-8');

  // ── Phase C: Install + Build + Test ───────────────────────────
  const hasTests = selectedFws.includes('react');
  const result = runSetup(ROOT, hasTests);

  if (!result.success) {
    console.error(`\n  ✗ ${result.failedPhase} failed\n`);
    console.error('  Error output:');
    const lines = (result.error || '').split('\n').slice(0, 30);
    for (const line of lines) console.error(`    ${line}`);
    console.error(`\n  Try running manually: ${result.failedPhase}\n`);
    process.exit(1);
  }

  // ── Phase D: Figma DS CLI setup (if selected) ──────────────────
  if (figma === 'cli') {
    console.log('\n  Setting up Figma DS CLI...\n');
    const cliResult = spawnSync('node', ['scripts/setup-figma-cli.js'], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    if (cliResult.status !== 0) {
      console.log('\n  ⚠  Figma DS CLI setup did not complete.');
      console.log('  You can run it later: pnpm setup:figma-cli\n');
    }
  }

  // ── Phase E: Success summary ──────────────────────────────────
  printSuccess({ name, prefix, selectedFws, headlessLib, figma, ide, removingAll });
}

// ─── Success summary ──────────────────────────────────────────────

function printSuccess({ name, prefix, selectedFws, headlessLib, figma, ide, removingAll }) {
  const IDE_CONFIG = {
    cursor: { label: 'Cursor', path: '.cursor/rules/' },
    'cursor-claude': { label: 'Cursor + Claude Code', path: '.cursor/rules/ + CLAUDE.md' },
    claude: { label: 'Claude Code', path: 'CLAUDE.md' },
    windsurf: { label: 'Windsurf', path: '.windsurfrules' },
    copilot: { label: 'GitHub Copilot', path: '.github/copilot-instructions.md' },
    antigravity: { label: 'Google Antigravity', path: '.antigravity/rules.md' },
    opencode: { label: 'OpenCode', path: 'AGENTS.md' },
    codex: { label: 'OpenAI Codex', path: 'AGENTS.md + .codex/config.toml' },
    other: { label: 'your IDE', path: 'docs/ARCHITECTURE.md' },
  };

  const ideInfo = IDE_CONFIG[ide] || IDE_CONFIG.other;
  const fwNames = selectedFws.map(capitalize);
  const fwLabel = fwNames.length
    ? fwNames.join(', ') + ', HTML/CSS'
    : 'HTML/CSS only';

  console.log(`\n  ✅ ${name} is ready!\n`);
  console.log(`  Your prefix: ${prefix}`);
  console.log(`  Classes:     .${prefix}-button, .${prefix}-button--primary`);
  console.log(`  Variables:   --${prefix}-color-action-primary\n`);
  console.log(`  Frameworks:  ${fwLabel}`);

  if (headlessLib && headlessLib !== 'none') {
    const headlessNames = {
      radix: 'Radix UI', 'base-ui': 'Base UI', 'headless-ui': 'Headless UI',
      'ark-ui': 'Ark UI', 'angular-primitives': 'Angular Primitives', zag: 'Zag.js',
    };
    console.log(`  Headless UI: ${headlessNames[headlessLib] || headlessLib}`);
    console.log(`  Setup guide: guides/framework-integration/${headlessLib}.md`);
  }

  if (!removingAll) {
    console.log('  Storybook:   pnpm dev (opens at localhost:6006)');
  }

  console.log('  Build:       pnpm build');
  console.log('  Tests:       pnpm -w test\n');

  console.log(
    `  IDE config:  ${ideInfo.path} (${ideInfo.label} reads this automatically)\n`
  );

  // Figma status + setup guide reference
  if (figma === 'console' || figma === 'devmode') {
    const figmaLabels = { console: 'Console MCP', devmode: 'Dev Mode MCP' };
    console.log(`  Figma:       Connected via ${figmaLabels[figma]}`);
    if (figma === 'console') {
      console.log(
        '  Setup guide: guides/figma-console-mcp-setup.md (Desktop Bridge + token setup)'
      );
    }
  } else if (figma === 'cli') {
    console.log('  Figma:       DS CLI (direct Desktop access via Chrome DevTools)');
  } else {
    console.log(
      '  Figma:       Not configured — edit .mcp.json or re-run init'
    );
  }

  console.log('\n  Key files:');
  console.log(
    '    docs/ARCHITECTURE.md      Architecture deep-dive (read first)'
  );
  console.log(
    '    blueprints/               Skeleton templates for new components'
  );
  console.log(
    '    packages/tokens/src/      Your design tokens (edit these)'
  );
  console.log(
    '    packages/css-components/  CSS component library'
  );

  console.log(
    '\n  Note: Internal packages use the @vcds/ scope. You can change this'
  );
  console.log('  when you\'re ready to publish to npm.\n');

  console.log('  Next steps:');
  console.log(
    '    1. Open your IDE — agent rules are already configured'
  );
  console.log(
    '    2. Edit tokens in packages/tokens/src/ to match your brand'
  );
  console.log(
    "    3. Run 'pnpm build' to recompile with your tokens"
  );
  console.log(
    '    4. Ask your AI agent: "Create an Input component following the Button pattern"'
  );
  console.log();
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  printBanner();
  await checkIdempotency();
  const answers = await gatherAnswers();
  printSummary(answers);

  const ok = await confirm({ message: 'Proceed with setup?', default: true });
  if (!ok) {
    console.log('\n  Aborted. No changes made.\n');
    process.exit(0);
  }

  await execute(answers);
}

main().catch((err) => {
  // @inquirer/prompts throws ExitPromptError on Ctrl+C
  if (err.name === 'ExitPromptError') {
    console.log('\n\n  Cancelled. No changes made.\n');
    process.exit(0);
  }
  console.error('\n  Unexpected error:', err.message);
  process.exit(1);
});
