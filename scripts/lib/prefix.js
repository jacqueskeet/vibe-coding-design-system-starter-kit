/**
 * Shared prefix validation and update logic.
 *
 * Used by both `scripts/init.js` (onboarding CLI) and `scripts/set-prefix.js`
 * (standalone prefix updater). Do not add prompts or console output here —
 * callers handle their own UI.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
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
