#!/usr/bin/env node

/**
 * set-prefix.js — Change the design system prefix across the entire repo.
 *
 * Usage:
 *   node scripts/set-prefix.js <new-prefix>
 *   node scripts/set-prefix.js acme
 *   node scripts/set-prefix.js myds
 *
 * This updates:
 *   1. ds.config.json                      (source of truth)
 *   2. packages/css-components/src/_config.scss  (SCSS $prefix)
 *   3. packages/shared/prefix.ts           (JS/TS DS_PREFIX constant)
 *
 * After running, rebuild:
 *   pnpm build
 *
 * The prefix flows automatically to:
 *   - Style Dictionary → CSS custom properties (--{prefix}-color-*)
 *   - CSS components → BEM classes (.{prefix}-button)
 *   - Framework wrappers → class strings via @ds/shared
 */

import { validatePrefix, applyPrefix, readCurrentPrefix } from './lib/prefix.js';

// ─── Validate input ──────────────────────────────────────────────

const newPrefix = process.argv[2];

if (!newPrefix) {
  console.error('\n  Usage: node scripts/set-prefix.js <new-prefix>\n');
  console.error('  Example: node scripts/set-prefix.js acme');
  console.error('           node scripts/set-prefix.js myds\n');
  process.exit(1);
}

const err = validatePrefix(newPrefix);
if (err) {
  console.error(`\n  ❌ Invalid prefix: "${newPrefix}"`);
  console.error(`  ${err}`);
  console.error('\n  Valid:   acme, my-ds, vcds, x1');
  console.error('  Invalid: -acme, ACME, my_ds, acme-\n');
  process.exit(1);
}

// ─── Check for no-op ────────────────────────────────────────────

const oldPrefix = readCurrentPrefix();

if (oldPrefix === newPrefix) {
  console.log(`\n  Prefix is already "${newPrefix}" — nothing to do.\n`);
  process.exit(0);
}

// ─── Apply ──────────────────────────────────────────────────────

console.log(`\n  Changing prefix: "${oldPrefix}" → "${newPrefix}"\n`);

applyPrefix(newPrefix);

console.log('  ✓ ds.config.json');
console.log('  ✓ packages/css-components/src/_config.scss');
console.log('  ✓ packages/shared/prefix.ts');

console.log(`
  ✅ Prefix updated to "${newPrefix}"

  Next steps:
    1. Rebuild tokens:   pnpm build:tokens
    2. Rebuild CSS:      pnpm build:css
    3. Rebuild all:      pnpm build

  Your CSS will now use:
    Classes:    .${newPrefix}-button, .${newPrefix}-button--primary
    Variables:  --${newPrefix}-color-action-primary
    JS:         import { DS_PREFIX } from '@ds/shared'  // "${newPrefix}"
`);
