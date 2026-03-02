/**
 * Workspace manager — reads, writes, and generates pnpm-workspace.yaml
 * to control which packages pnpm resolves during install.
 *
 * Used by init.js to implement two-phase selective installs:
 *   Phase 1: Core packages only (for bootstrapping @inquirer/prompts)
 *   Phase 2: Core + user-selected frameworks (final workspace state)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ─── Constants ──────────────────────────────────────────────────

/** Packages always included regardless of framework selection */
const CORE_PACKAGES = [
  'packages/tokens',
  'packages/css-components',
  'packages/css',
  'packages/shared',
  'packages/html',
];

/** Framework → workspace package path(s) */
const FRAMEWORK_PACKAGES = {
  react: ['packages/react'],
  vue: ['packages/vue'],
  svelte: ['packages/svelte'],
};

/** Storybook docs — only included when React is selected (it depends on React) */
const DOCS_PACKAGE = 'packages/docs';

/** Default workspace glob that includes everything */
const DEFAULT_GLOB = "  - 'packages/*'";

const WORKSPACE_FILE = 'pnpm-workspace.yaml';

// ─── Exports ────────────────────────────────────────────────────

/**
 * Read the current pnpm-workspace.yaml content.
 * @param {string} root — absolute path to repo root
 * @returns {string|null} Raw file content, or null if file doesn't exist
 */
export function readWorkspaceYaml(root) {
  const filePath = resolve(root, WORKSPACE_FILE);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf-8');
}

/**
 * Write pnpm-workspace.yaml with an explicit list of package paths.
 * @param {string}   root         — absolute path to repo root
 * @param {string[]} packagePaths — e.g. ['packages/tokens', 'packages/react']
 */
export function writeWorkspaceYaml(root, packagePaths) {
  const lines = ['packages:'];
  for (const p of packagePaths) {
    lines.push(`  - '${p}'`);
  }
  const content = lines.join('\n') + '\n';
  writeFileSync(resolve(root, WORKSPACE_FILE), content, 'utf-8');
}

/**
 * Restore the default glob-based pnpm-workspace.yaml.
 * This is the original state that includes all packages.
 * @param {string} root — absolute path to repo root
 */
export function writeDefaultWorkspaceYaml(root) {
  const content = `packages:\n${DEFAULT_GLOB}\n`;
  writeFileSync(resolve(root, WORKSPACE_FILE), content, 'utf-8');
}

/**
 * Check whether pnpm-workspace.yaml uses the default glob ('packages/*').
 * @param {string} root — absolute path to repo root
 * @returns {boolean} true if the file uses 'packages/*', false if restricted
 */
export function isDefaultWorkspace(root) {
  const content = readWorkspaceYaml(root);
  if (content === null) return false;
  return content.includes("'packages/*'") || content.includes('"packages/*"');
}

/**
 * Build the final workspace package list based on selected frameworks.
 * Always includes CORE_PACKAGES. Adds framework-specific packages as selected.
 * Includes Storybook docs if React is selected.
 *
 * @param {string[]} selectedFrameworks — e.g. ['react'] or ['react', 'vue']
 * @returns {string[]} Package paths for pnpm-workspace.yaml
 */
export function buildWorkspacePackageList(selectedFrameworks) {
  const packages = [...CORE_PACKAGES];

  for (const fw of selectedFrameworks) {
    if (FRAMEWORK_PACKAGES[fw]) {
      packages.push(...FRAMEWORK_PACKAGES[fw]);
    }
  }

  // Storybook docs requires React
  if (selectedFrameworks.includes('react')) {
    packages.push(DOCS_PACKAGE);
  }

  return packages;
}

export { CORE_PACKAGES };
