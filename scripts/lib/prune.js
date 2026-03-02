/**
 * Framework pruning — removes unused framework packages, blueprints,
 * build scripts, and (best-effort) agent config references.
 */

import { rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
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
};

const ALL_JS_FRAMEWORKS = ['react', 'vue', 'svelte'];

const AGENT_CONFIG_FILES = [
  'CLAUDE.md',
  'AGENTS.md',
  '.cursor/rules/components.mdc',
  '.cursor/rules/design-system.mdc',
  '.windsurfrules',
  '.antigravity/rules.md',
  '.github/copilot-instructions.md',
];

/**
 * Build the root `build` script based on which frameworks remain.
 * @param {string[]} removed
 * @param {boolean} removingAll
 * @returns {string}
 */
function buildScript(removed, removingAll) {
  const base = [
    'pnpm --filter @ds/tokens build',
    'pnpm --filter @ds/css-components build',
    'pnpm --filter @ds/css build',
  ];

  if (removingAll) {
    return base.join(' && ');
  }

  // Build exclusion filters for the -r (recursive) tail
  const excludeFilters = [
    "--filter='!@ds/tokens'",
    "--filter='!@ds/css-components'",
    "--filter='!@ds/css'",
  ];

  return [...base, `pnpm -r ${excludeFilters.join(' ')} build`].join(' && ');
}

/**
 * Remove directories and update root package.json for deselected frameworks.
 *
 * @param {string[]} toRemove  — e.g. ['vue', 'svelte']
 * @param {string}   root      — absolute path to repo root
 * @returns {string[]} Log of completed operations.
 */
export function pruneFrameworks(toRemove, root) {
  const log = [];
  const removingAll = ALL_JS_FRAMEWORKS.every((f) => toRemove.includes(f));

  // Gather directories and scripts to remove
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

  // Remove directories
  for (const dir of dirsToRemove) {
    const abs = resolve(root, dir);
    if (existsSync(abs)) {
      rmSync(abs, { recursive: true, force: true });
      log.push(`Removed ${dir}/`);
    }
  }

  // Update root package.json — remove scripts, rewrite build command
  const pkgPath = resolve(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  for (const script of scriptsToRemove) {
    if (pkg.scripts?.[script]) {
      delete pkg.scripts[script];
      log.push(`Removed script: ${script}`);
    }
  }

  // Rewrite the main build script
  pkg.scripts.build = buildScript(toRemove, removingAll);
  log.push('Updated build script');

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

  // Update vitest.workspace.ts if React is pruned
  if (toRemove.includes('react')) {
    const vitestPath = resolve(root, 'vitest.workspace.ts');
    if (existsSync(vitestPath)) {
      writeFileSync(vitestPath, 'export default [];\n', 'utf-8');
      log.push('Updated vitest.workspace.ts');
    }
  }

  return log;
}

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
        const cap = fw.charAt(0).toUpperCase() + fw.slice(1); // "React"

        // Lines like: - **React**: TypeScript, CSS Modules consuming token CSS vars
        const techStackLine = new RegExp(
          `^- \\*\\*${cap}\\*\\*:.*\\n`,
          'gm'
        );
        // Lines like: ├── @ds/react     → Props → ...
        const treeLine = new RegExp(`^.*[├└]── @ds/${fw}.*\\n`, 'gm');
        // Lines like: pnpm --filter @ds/react build
        const cmdLine = new RegExp(
          `^pnpm --filter @ds/${fw} build.*\\n`,
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
