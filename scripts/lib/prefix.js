/**
 * Shared prefix validation and update logic.
 *
 * Used by both `scripts/init.js` (onboarding CLI) and `scripts/set-prefix.js`
 * (standalone prefix updater). Do not add prompts or console output here —
 * callers handle their own UI.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(__dirname, '../..');

/** Regex for valid prefixes: lowercase alphanumeric + hyphens, no leading/trailing hyphens. */
export const VALID_PREFIX = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;

/**
 * Validate a prefix string.
 * @param {string} prefix
 * @returns {string|null} Error message if invalid, null if valid.
 */
export function validatePrefix(prefix) {
  if (!prefix || typeof prefix !== 'string') return 'Prefix is required';
  if (!VALID_PREFIX.test(prefix)) {
    return 'Must be lowercase alphanumeric with optional hyphens, no leading/trailing hyphens';
  }
  return null;
}

/**
 * Read the current prefix from ds.config.json without modifying anything.
 * @param {string} [root]
 * @returns {string}
 */
export function readCurrentPrefix(root = DEFAULT_ROOT) {
  const configPath = resolve(root, 'ds.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  return config.prefix;
}

/**
 * Apply a new prefix to all three target files:
 *   1. ds.config.json        → prefix field
 *   2. _config.scss           → $prefix variable
 *   3. packages/shared/prefix.ts → DS_PREFIX constant
 *
 * @param {string} newPrefix
 * @param {string} [root]
 * @returns {string} The previous prefix value.
 */
export function applyPrefix(newPrefix, root = DEFAULT_ROOT) {
  // 1. ds.config.json
  const configPath = resolve(root, 'ds.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const oldPrefix = config.prefix;
  config.prefix = newPrefix;
  writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

  // 2. packages/css-components/src/_config.scss
  const scssPath = resolve(root, 'packages/css-components/src/_config.scss');
  let scss = readFileSync(scssPath, 'utf-8');
  scss = scss.replace(/\$prefix:\s*'[^']*'/, `$prefix: '${newPrefix}'`);
  writeFileSync(scssPath, scss, 'utf-8');

  // 3. packages/shared/prefix.ts
  const tsPath = resolve(root, 'packages/shared/prefix.ts');
  let ts = readFileSync(tsPath, 'utf-8');
  ts = ts.replace(
    /export const DS_PREFIX = '[^']*'/,
    `export const DS_PREFIX = '${newPrefix}'`
  );
  writeFileSync(tsPath, ts, 'utf-8');

  return oldPrefix;
}

// ── Global prefix propagation ──────────────────────────────────────

const SCAN_EXTENSIONS = new Set([
  '.md', '.mdc', '.html', '.scss', '.css', '.ts', '.tsx',
  '.vue', '.svelte', '.json', '.yml', '.yaml',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'platforms', '.claude',
]);

/** Known text files without a recognizable extension */
const KNOWN_TEXTFILES = new Set(['.windsurfrules']);

/** Files to never modify (too large or not relevant) */
const SKIP_FILES = new Set(['pnpm-lock.yaml']);

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Recursively collect text files that may contain prefix references.
 */
function collectTextFiles(root) {
  const results = [];

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(fullPath);
      } else if (entry.isFile()) {
        if (SKIP_FILES.has(entry.name)) continue;
        const ext = extname(entry.name);
        if (SCAN_EXTENSIONS.has(ext) || KNOWN_TEXTFILES.has(entry.name)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(root);
  return results;
}

/**
 * Propagate a prefix change across ALL text files in the repo.
 *
 * Replaces:
 *   - `{old}-` → `{new}-`   (class names, CSS vars, animations)
 *     but NOT when preceded by [a-z0-9] (avoids partial-word matches)
 *   - `'{old}'` → `'{new}'`  (single-quoted strings)
 *   - `"{old}"` → `"{new}"`  (double-quoted strings)
 *   - `` `{old}` `` → `` `{new}` ``  (backtick-quoted in markdown)
 *
 * NEVER replaces `@{old}/` (npm package scope) — the dash pattern
 * requires a trailing `-` (scopes use `/`) and quoted patterns require
 * exact quoting (scopes have `@` prefix inside the quotes).
 *
 * Call this AFTER applyPrefix() — the 3 config files are already updated
 * by then, so this handles everything else.
 *
 * @param {string} oldPrefix
 * @param {string} newPrefix
 * @param {string} [root]
 * @returns {string[]} List of updated file paths (relative to root).
 */
export function propagatePrefix(oldPrefix, newPrefix, root = DEFAULT_ROOT) {
  const log = [];
  if (oldPrefix === newPrefix) return log;

  const files = collectTextFiles(root);
  const esc = escapeRegex(oldPrefix);

  // 1. {old}- → {new}- but not inside a word (e.g. "myvcds-button")
  const dashPattern = new RegExp(`(?<![a-z0-9])${esc}-`, 'g');

  // 2-4. Quoted variants
  const singleQ = new RegExp(`'${esc}'`, 'g');
  const doubleQ = new RegExp(`"${esc}"`, 'g');
  const backtickQ = new RegExp(`\`${esc}\``, 'g');

  const replacements = [
    [dashPattern, `${newPrefix}-`],
    [singleQ, `'${newPrefix}'`],
    [doubleQ, `"${newPrefix}"`],
    [backtickQ, `\`${newPrefix}\``],
  ];

  for (const filePath of files) {
    try {
      let content = readFileSync(filePath, 'utf-8');
      let changed = false;

      for (const [pattern, replacement] of replacements) {
        // Reset lastIndex for global regexes
        pattern.lastIndex = 0;
        const after = content.replace(pattern, replacement);
        if (after !== content) {
          content = after;
          changed = true;
        }
      }

      if (changed) {
        writeFileSync(filePath, content, 'utf-8');
        log.push(filePath.substring(root.length + 1));
      }
    } catch {
      // Skip files that can't be read/written
    }
  }

  return log;
}
