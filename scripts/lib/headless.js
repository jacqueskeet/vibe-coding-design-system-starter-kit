/**
 * Headless UI library selection and installation logic.
 *
 * Used by init.js to present a filtered list of headless UI libraries
 * based on the user's selected frameworks, install the chosen library,
 * and prune non-selected integration guides.
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

// ─── Constants ──────────────────────────────────────────────────

/**
 * Map of headless library → metadata.
 *
 * `packages`: Object mapping framework → npm package(s) to install.
 * `requires`: Array of frameworks the library supports (at least one must be selected).
 * `guide`: Filename of the integration guide (in guides/framework-integration/).
 */
export const HEADLESS_MAP = {
  radix: {
    label: 'Radix UI',
    description: 'Unstyled, accessible React primitives (dialog, dropdown, tooltip)',
    packages: {
      react: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
    },
    requires: ['react'],
    guide: 'radix.md',
  },
  'base-ui': {
    label: 'Base UI',
    description: 'Unstyled React components from the MUI team',
    packages: {
      react: ['@base-ui-components/react'],
    },
    requires: ['react'],
    guide: 'base-ui.md',
  },
  'headless-ui': {
    label: 'Headless UI',
    description: 'Unstyled, accessible components for React and Vue (by Tailwind Labs)',
    packages: {
      react: ['@headlessui/react'],
      vue: ['@headlessui/vue'],
    },
    requires: ['react', 'vue'],
    guide: 'headless-ui.md',
  },
  'ark-ui': {
    label: 'Ark UI',
    description: 'Headless components for React, Vue, and Svelte (built on Zag.js)',
    packages: {
      react: ['@ark-ui/react'],
      vue: ['@ark-ui/vue'],
      svelte: ['@ark-ui/svelte'],
    },
    requires: ['react', 'vue', 'svelte'],
    guide: 'ark-ui.md',
  },
  'angular-primitives': {
    label: 'Angular Primitives',
    description: 'Headless, composable primitives for accessible Angular components',
    packages: {
      angular: ['ng-primitives'],
    },
    requires: ['angular'],
    guide: 'angular-primitives.md',
  },
  zag: {
    label: 'Zag.js',
    description: 'Framework-agnostic UI state machines (lower-level than Ark UI)',
    packages: {
      react: ['@zag-js/react'],
      vue: ['@zag-js/vue'],
      svelte: ['@zag-js/svelte'],
      angular: ['@zag-js/core'],
    },
    requires: ['react', 'vue', 'svelte', 'angular'],
    guide: 'zag.md',
  },
};

// ─── Exports ────────────────────────────────────────────────────

/**
 * Build the list of headless library choices filtered by the user's
 * selected frameworks. Returns an array suitable for @inquirer/prompts select().
 *
 * @param {string[]} selectedFrameworks — e.g. ['react', 'angular']
 * @returns {Array<{name: string, value: string, description: string}>}
 */
export function buildHeadlessChoices(selectedFrameworks) {
  const choices = [];

  for (const [key, lib] of Object.entries(HEADLESS_MAP)) {
    // Include if at least one required framework is selected
    const available = lib.requires.some((fw) => selectedFrameworks.includes(fw));
    if (!available) continue;

    // Show which selected frameworks this library supports
    const supportedFws = lib.requires
      .filter((fw) => selectedFrameworks.includes(fw))
      .map((fw) => fw.charAt(0).toUpperCase() + fw.slice(1))
      .join(', ');

    choices.push({
      name: `${lib.label} (${supportedFws})`,
      value: key,
      description: lib.description,
    });
  }

  choices.push({
    name: 'None / decide later',
    value: 'none',
    description: 'Skip — all integration guides are kept for reference',
  });

  return choices;
}

/**
 * Install headless library packages into the relevant framework package.json files.
 *
 * Adds packages as `dependencies` (not devDependencies) in the relevant
 * framework package.json files. Does NOT run `pnpm install` — that happens
 * in Phase C of init.js.
 *
 * @param {string} lib       — headless library key (e.g. 'radix', 'ark-ui')
 * @param {string[]} frameworks — selected frameworks (e.g. ['react', 'angular'])
 * @param {string} root      — repo root path
 * @returns {string[]} Log of updated files.
 */
export function installHeadlessLib(lib, frameworks, root) {
  const log = [];
  if (lib === 'none' || !HEADLESS_MAP[lib]) return log;

  const spec = HEADLESS_MAP[lib];

  for (const fw of frameworks) {
    const packages = spec.packages[fw];
    if (!packages || packages.length === 0) continue;

    const pkgPath = resolve(root, `packages/${fw}/package.json`);
    if (!existsSync(pkgPath)) continue;

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (!pkg.dependencies) pkg.dependencies = {};

    for (const dep of packages) {
      pkg.dependencies[dep] = 'latest';
    }

    // Sort dependencies for consistency
    pkg.dependencies = Object.fromEntries(
      Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b))
    );

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    log.push(`Added ${packages.join(', ')} to packages/${fw}/package.json`);
  }

  return log;
}

/**
 * Prune integration guides based on the user's headless library selection.
 *
 * - If 'none' → keep all guides (framework-based pruning is enough)
 * - If specific lib → keep only that lib's guide + shadcn.md (reference doc)
 *   Remove all other integration guides.
 *
 * This runs AFTER pruneFrameworks() which already removes guides for
 * deselected frameworks.
 *
 * @param {string} selectedLib — 'radix', 'ark-ui', 'none', etc.
 * @param {string} root
 * @returns {string[]} Log of removed guides.
 */
export function pruneHeadlessGuides(selectedLib, root) {
  const log = [];
  if (selectedLib === 'none') return log;

  const guidesDir = resolve(root, 'guides/framework-integration');
  const keepGuide = HEADLESS_MAP[selectedLib]?.guide;
  if (!keepGuide) return log;

  // Always keep: selected library guide, shadcn.md (reference doc), zag.md (foundational)
  const alwaysKeep = new Set([keepGuide, 'shadcn.md']);
  // If user selected zag, still keep zag.md (it's selected). Otherwise keep it as reference.
  alwaysKeep.add('zag.md');

  // Collect all guide filenames from HEADLESS_MAP
  const allGuides = Object.values(HEADLESS_MAP).map((lib) => lib.guide);
  // Also include shadcn.md (not in HEADLESS_MAP but exists as reference)
  allGuides.push('shadcn.md');

  for (const guide of allGuides) {
    if (alwaysKeep.has(guide)) continue;

    const guidePath = resolve(guidesDir, guide);
    if (existsSync(guidePath)) {
      unlinkSync(guidePath);
      log.push(`Removed guides/framework-integration/${guide}`);
    }
  }

  return log;
}
