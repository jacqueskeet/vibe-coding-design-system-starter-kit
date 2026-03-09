/**
 * Framework pruning — removes unused framework packages, blueprints,
 * guides, build scripts, and (best-effort) documentation references.
 *
 * Called by init.js Phase B after the user selects which frameworks to keep.
 */

import { rmSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const FRAMEWORK_MAP = {
  react: {
    dirs: ['packages/react', 'blueprints/react'],
    scripts: ['build:react'],
  },
  vue: {
    dirs: ['packages/vue', 'blueprints/vue'],
    scripts: ['build:vue'],
  },
  svelte: {
    dirs: ['packages/svelte', 'blueprints/svelte'],
    scripts: ['build:svelte'],
  },
  angular: {
    dirs: ['packages/angular', 'blueprints/angular'],
    scripts: ['build:angular'],
  },
};

const ALL_JS_FRAMEWORKS = ['react', 'vue', 'svelte', 'angular'];

/**
 * Framework integration guides and the frameworks they require.
 * A guide is deleted when ALL of its required frameworks have been removed.
 * (e.g., headless-ui needs react OR vue — deleted only when both are gone)
 */
const GUIDE_REQUIREMENTS = {
  'guides/framework-integration/radix.md': ['react'],
  'guides/framework-integration/shadcn.md': ['react'],
  'guides/framework-integration/base-ui.md': ['react'],
  'guides/framework-integration/headless-ui.md': ['react', 'vue'],
  'guides/framework-integration/ark-ui.md': ['react', 'vue', 'svelte'],
  'guides/framework-integration/angular-primitives.md': ['angular'],
  // zag.md is framework-agnostic — never pruned
};

/** Guide name → display name for the README framework integration table */
const GUIDE_TABLE_NAMES = {
  'radix.md': 'Radix UI',
  'shadcn.md': 'shadcn/ui',
  'base-ui.md': 'Base UI',
  'headless-ui.md': 'Headless UI',
  'ark-ui.md': 'Ark UI',
  'angular-primitives.md': 'Angular Primitives',
};

const AGENT_CONFIG_FILES = [
  'CLAUDE.md',
  'AGENTS.md',
  '.cursor/rules/components.mdc',
  '.cursor/rules/design-system.mdc',
  '.cursor/rules/tokens.mdc',
  '.windsurfrules',
  '.antigravity/rules.md',
  '.github/copilot-instructions.md',
];

/**
 * IDE choice → which IDE-specific dirs/files to KEEP.
 * Everything not in the "keep" list gets deleted.
 * 'other' = keep everything (null signals no pruning).
 *
 * Note: .github/ dir is NEVER deleted because it contains CI workflows.
 *       Only .github/copilot-instructions.md is removed when Copilot isn't chosen.
 * Note: AGENTS.md is read by both OpenCode and Google Antigravity.
 */
const IDE_KEEP_MAP = {
  cursor: {
    dirs: ['.cursor'],
    files: [],
  },
  'cursor-claude': {
    dirs: ['.cursor'],
    files: ['CLAUDE.md'],
  },
  claude: {
    dirs: [],
    files: ['CLAUDE.md'],
  },
  windsurf: {
    dirs: [],
    files: ['.windsurfrules'],
  },
  copilot: {
    dirs: [],
    files: ['.github/copilot-instructions.md'],
  },
  antigravity: {
    dirs: ['.antigravity'],
    files: ['AGENTS.md'], // Antigravity also reads AGENTS.md
  },
  opencode: {
    dirs: [],
    files: ['AGENTS.md'],
  },
  other: null, // keep everything
};

/** All IDE-specific directories (that are ONLY for IDE config) */
const ALL_IDE_DIRS = ['.cursor', '.antigravity'];

/** All IDE-specific files */
const ALL_IDE_FILES = [
  'CLAUDE.md',
  'AGENTS.md',
  '.windsurfrules',
  '.github/copilot-instructions.md',
];

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Build the root `build` script based on which frameworks remain.
 */
function buildScript(removed, removingAll) {
  const base = [
    'pnpm --filter @vcds/tokens build',
    'pnpm --filter @vcds/css-components build',
    'pnpm --filter @vcds/css build',
  ];

  if (removingAll) {
    return base.join(' && ');
  }

  const excludeFilters = [
    "--filter='!@vcds/tokens'",
    "--filter='!@vcds/css-components'",
    "--filter='!@vcds/css'",
  ];

  return [...base, `pnpm -r ${excludeFilters.join(' ')} build`].join(' && ');
}

/**
 * Safely remove a file if it exists.
 */
function removeFile(abs) {
  if (existsSync(abs)) {
    unlinkSync(abs);
    return true;
  }
  return false;
}

/**
 * Safely read a file, returning null if it doesn't exist.
 */
function safeRead(abs) {
  if (!existsSync(abs)) return null;
  return readFileSync(abs, 'utf-8');
}

// ── Main pruning ──────────────────────────────────────────────────

/**
 * Remove directories, files, and update root package.json for deselected frameworks.
 *
 * @param {string[]} toRemove  — e.g. ['vue', 'svelte']
 * @param {string}   root      — absolute path to repo root
 * @returns {string[]} Log of completed operations.
 */
export function pruneFrameworks(toRemove, root) {
  const log = [];
  const removingAll = ALL_JS_FRAMEWORKS.every((f) => toRemove.includes(f));

  // ── Remove package + blueprint directories ──────────────────────
  const dirsToRemove = [];
  const scriptsToRemove = [];

  for (const fw of toRemove) {
    const spec = FRAMEWORK_MAP[fw];
    if (!spec) continue;
    dirsToRemove.push(...spec.dirs);
    scriptsToRemove.push(...spec.scripts);
  }

  // If all JS frameworks gone → also remove Storybook docs
  if (removingAll) {
    dirsToRemove.push('packages/docs');
    scriptsToRemove.push('dev');
  }

  for (const dir of dirsToRemove) {
    const abs = resolve(root, dir);
    if (existsSync(abs)) {
      rmSync(abs, { recursive: true, force: true });
      log.push(`Removed ${dir}/`);
    }
  }

  // ── Remove framework-specific integration guides ────────────────
  for (const [guide, requiredFws] of Object.entries(GUIDE_REQUIREMENTS)) {
    const allGone = requiredFws.every((fw) => toRemove.includes(fw));
    if (allGone) {
      if (removeFile(resolve(root, guide))) {
        log.push(`Removed ${guide}`);
      }
    }
  }

  // ── Update root package.json ────────────────────────────────────
  const pkgPath = resolve(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  for (const script of scriptsToRemove) {
    if (pkg.scripts?.[script]) {
      delete pkg.scripts[script];
      log.push(`Removed script: ${script}`);
    }
  }

  pkg.scripts.build = buildScript(toRemove, removingAll);
  log.push('Updated build script');

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

  // ── Update vitest.workspace.ts ──────────────────────────────────
  const vitestPath = resolve(root, 'vitest.workspace.ts');
  if (existsSync(vitestPath)) {
    const remaining = ALL_JS_FRAMEWORKS.filter((f) => !toRemove.includes(f));
    const entries = remaining.map((f) => `'packages/${f}'`);
    writeFileSync(vitestPath, `export default [${entries.join(', ')}];\n`, 'utf-8');
    log.push('Updated vitest.workspace.ts');
  }

  return log;
}

// ── Agent config cleanup ──────────────────────────────────────────

/**
 * Best-effort cleanup of agent config files — remove lines that exclusively
 * reference pruned frameworks. Conservative patterns only.
 *
 * @param {string[]} toRemove
 * @param {string}   root
 * @returns {string[]} Log of updated files.
 */
export function cleanupAgentConfigs(toRemove, root) {
  const log = [];

  for (const file of AGENT_CONFIG_FILES) {
    try {
      const abs = resolve(root, file);
      if (!existsSync(abs)) continue;

      let content = readFileSync(abs, 'utf-8');
      let changed = false;

      for (const fw of toRemove) {
        const cap = fw.charAt(0).toUpperCase() + fw.slice(1);

        // Lines like: - **React**: TypeScript, CSS Modules consuming token CSS vars
        const techStackLine = new RegExp(
          `^- \\*\\*${cap}\\*\\*:.*\\n`,
          'gm'
        );
        // Lines like: ├── @vcds/react     → Props → ...
        const treeLine = new RegExp(`^.*[├└]── @vcds/${fw}.*\\n`, 'gm');
        // Lines like: pnpm --filter @vcds/react build
        const cmdLine = new RegExp(
          `^pnpm --filter @vcds/${fw} build.*\\n`,
          'gm'
        );
        // Lines like: │   ├── react/           # React — thin wrappers ...
        const dirLine = new RegExp(
          `^.*│.*${fw}/.*#.*${cap}.*\\n`,
          'gm'
        );
        // Lines like: blueprints/react/ entries
        const bpLine = new RegExp(
          `^.*├── ${fw}/.*blueprint.*\\n`,
          'gmi'
        );

        for (const pattern of [
          techStackLine,
          treeLine,
          cmdLine,
          dirLine,
          bpLine,
        ]) {
          const after = content.replace(pattern, '');
          if (after !== content) {
            content = after;
            changed = true;
          }
        }
      }

      if (changed) {
        writeFileSync(abs, content, 'utf-8');
        log.push(`Updated ${file}`);
      }
    } catch {
      log.push(`Skipped ${file}`);
    }
  }

  return log;
}

// ── README cleanup ────────────────────────────────────────────────

/**
 * Clean up README.md — remove framework-specific package descriptions,
 * architecture diagram lines, repo structure entries, and integration
 * guide table rows for pruned frameworks.
 *
 * @param {string[]} toRemove
 * @param {string}   root
 * @returns {string[]} Log of changes.
 */
export function cleanupReadme(toRemove, root) {
  const log = [];
  const readmePath = resolve(root, 'README.md');
  const content = safeRead(readmePath);
  if (!content) return log;

  const remaining = ALL_JS_FRAMEWORKS.filter((f) => !toRemove.includes(f));
  const removingAll = remaining.length === 0;
  let updated = content;

  // ── 1. Combined package heading: `@vcds/react` · `@vcds/vue` · `@vcds/svelte`
  // Rebuild the heading with only remaining frameworks
  if (remaining.length > 0) {
    const newParts = remaining.map((f) => `\`@vcds/${f}\``);
    const newHeading = `### ${newParts.join(' · ')}`;
    updated = updated.replace(
      /^### `@vcds\/react`\s*·?\s*`@vcds\/vue`\s*·?\s*`@vcds\/svelte`\s*·?\s*`@vcds\/angular`/m,
      newHeading
    );
    // Fallback for old format without angular
    updated = updated.replace(
      /^### `@vcds\/react`\s*·?\s*`@vcds\/vue`\s*·?\s*`@vcds\/svelte`/m,
      newHeading
    );
  } else {
    // Remove the entire framework packages section (heading + description paragraph)
    updated = updated.replace(
      /^### `@vcds\/react`.*\nThin framework wrappers[^\n]*\n/m,
      ''
    );
  }

  // ── 2. Architecture diagram — remove pruned framework lines
  for (const fw of toRemove) {
    const cap = fw.charAt(0).toUpperCase() + fw.slice(1);
    // Lines like: ├── @vcds/react        ← Props → BEM classes + React interactivity
    const archLine = new RegExp(
      `^.*[├└]── @vcds/${fw}\\s+←.*${cap}.*\\n`,
      'gm'
    );
    updated = updated.replace(archLine, '');
  }

  // Fix last remaining architecture line: ├── should be └── for the last item
  // Only if we removed some but not all frameworks
  if (remaining.length > 0 && toRemove.length > 0) {
    const lastFw = remaining[remaining.length - 1];
    const cap = lastFw.charAt(0).toUpperCase() + lastFw.slice(1);
    updated = updated.replace(
      new RegExp(`(\\s+)├── @vcds/${lastFw}(\\s+← Props.*${cap}.*)`, 'm'),
      `$1└── @vcds/${lastFw}$2`
    );
  }

  // ── 3. Repo structure — remove pruned framework directory entries
  for (const fw of toRemove) {
    const cap = fw.charAt(0).toUpperCase() + fw.slice(1);
    // Lines like: │   ├── react/           # React — thin wrappers over css-components
    const dirLine = new RegExp(
      `^│   [├└]── ${fw}/\\s+#.*\\n`,
      'gm'
    );
    updated = updated.replace(dirLine, '');

    // Blueprint entries: │   ├── react/           # React component blueprint
    const bpLine = new RegExp(
      `^│   [├└]── ${fw}/\\s+#.*blueprint.*\\n`,
      'gmi'
    );
    updated = updated.replace(bpLine, '');
  }

  // Also remove the Storybook docs line if all JS frameworks are gone
  if (removingAll) {
    updated = updated.replace(
      /^│   [├└]── docs\/\s+#.*Storybook.*\n/gm,
      ''
    );
  }

  // ── 4. Framework integration table — remove rows for deleted guides
  for (const [guide, requiredFws] of Object.entries(GUIDE_REQUIREMENTS)) {
    const allGone = requiredFws.every((fw) => toRemove.includes(fw));
    if (allGone) {
      const basename = guide.split('/').pop();
      const displayName = GUIDE_TABLE_NAMES[basename];
      if (displayName) {
        // Escape special regex chars in the display name
        const escaped = displayName.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
        const tableRow = new RegExp(
          `^\\| \\*\\*${escaped}\\*\\*.*\\n`,
          'gm'
        );
        updated = updated.replace(tableRow, '');
      }
    }
  }

  // ── 5. Badges — update framework badge to show only remaining
  if (remaining.length > 0 && remaining.length < 3) {
    const labels = remaining.map(
      (f) => f.charAt(0).toUpperCase() + f.slice(1)
    );
    // Always include HTML/CSS
    const badgeText = [...labels, 'HTML/CSS'].join('_|_');
    updated = updated.replace(
      /\[!\[Frameworks\]\(https:\/\/img\.shields\.io\/badge\/[^)]+\)\]/,
      `[![Frameworks](https://img.shields.io/badge/${badgeText}-blue?style=for-the-badge)]`
    );
  } else if (removingAll) {
    // Just HTML/CSS
    updated = updated.replace(
      /\[!\[Frameworks\]\(https:\/\/img\.shields\.io\/badge\/[^)]+\)\]\([^)]+\)\n?/,
      '[![HTML/CSS](https://img.shields.io/badge/HTML_|_CSS-blue?style=for-the-badge)](https://github.com/jacqueskeet/vibe-coding-design-system-starter-kit)\n'
    );
  }

  if (updated !== content) {
    writeFileSync(readmePath, updated, 'utf-8');
    log.push('Updated README.md (framework references)');
  }

  return log;
}

// ── Cursor rules cleanup ──────────────────────────────────────────

/**
 * Update .cursor/rules/components.mdc — remove framework globs and
 * code examples for pruned frameworks.
 *
 * @param {string[]} toRemove
 * @param {string}   root
 * @returns {string[]} Log of changes.
 */
export function cleanupCursorRules(toRemove, root) {
  const log = [];
  const rulePath = resolve(root, '.cursor/rules/components.mdc');
  const content = safeRead(rulePath);
  if (!content) return log;

  let updated = content;

  // ── 1. Update globs in frontmatter — remove pruned framework paths
  for (const fw of toRemove) {
    // Remove glob entry like: "packages/react/**/*",  (with optional trailing comma/space)
    updated = updated.replace(
      new RegExp(`\\s*"packages/${fw}/\\*\\*/\\*",?`, 'g'),
      ''
    );
  }
  // Clean up any trailing comma before the closing bracket
  updated = updated.replace(/,(\s*])/, '$1');

  // ── 2. Remove framework-specific code example sections
  for (const fw of toRemove) {
    const cap = fw.charAt(0).toUpperCase() + fw.slice(1);
    // Match: ### React (`packages/react/`) ... until next ### or ## or end
    const sectionPattern = new RegExp(
      `### ${cap} \\(\`packages/${fw}/\`\\)\\n[\\s\\S]*?(?=###|## Shared Rules)`,
      'g'
    );
    updated = updated.replace(sectionPattern, '');
  }

  // If all JS frameworks removed, simplify Step 3 header
  const removingAll = ALL_JS_FRAMEWORKS.every((f) => toRemove.includes(f));
  if (removingAll) {
    updated = updated.replace(
      /## Step 3: Framework Wrappers \(thin — NO styles\)\n+/,
      ''
    );
  }

  if (updated !== content) {
    writeFileSync(rulePath, updated, 'utf-8');
    log.push('Updated .cursor/rules/components.mdc');
  }

  return log;
}

// ── IDE config pruning ─────────────────────────────────────────────

/**
 * Delete IDE-specific folders and files that don't belong to the chosen IDE.
 *
 * If ideChoice is 'other', nothing is deleted (user wants all configs).
 * For any other choice, we keep only the relevant dirs/files and remove the rest.
 *
 * @param {string} ideChoice — e.g. 'cursor', 'cursor-claude', 'claude', etc.
 * @param {string} root      — absolute path to repo root
 * @returns {string[]} Log of removed items.
 */
export function pruneIdeConfigs(ideChoice, root) {
  const log = [];
  const keep = IDE_KEEP_MAP[ideChoice];

  // 'other' or unknown → keep everything
  if (keep === null || keep === undefined) return log;

  // Remove directories not in the keep list
  for (const dir of ALL_IDE_DIRS) {
    if (!keep.dirs.includes(dir)) {
      const abs = resolve(root, dir);
      if (existsSync(abs)) {
        rmSync(abs, { recursive: true, force: true });
        log.push(`Removed ${dir}/`);
      }
    }
  }

  // Remove files not in the keep list
  for (const file of ALL_IDE_FILES) {
    if (!keep.files.includes(file)) {
      if (removeFile(resolve(root, file))) {
        log.push(`Removed ${file}`);
      }
    }
  }

  return log;
}
