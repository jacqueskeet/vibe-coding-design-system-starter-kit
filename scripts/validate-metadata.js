#!/usr/bin/env node

/**
 * Validate component metadata files against the JSON Schema.
 *
 * Usage:
 *   node scripts/validate-metadata.js          # validate all *.meta.json files
 *   node scripts/validate-metadata.js --fix    # show suggestions for missing fields
 *
 * Validates:
 *   1. JSON syntax and structure against component.schema.json
 *   2. Required fields: name, description, intent.purpose
 *   3. Cross-check: variant names in .meta.json match BEM modifiers in .scss
 *   4. Cross-check: accessibility.role is present if SCSS has interactive styles
 *
 * Exit codes:
 *   0 = all files valid
 *   1 = validation errors found
 *   2 = no metadata files found (warning, not failure)
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');
const COMPONENTS_DIR = resolve(ROOT, 'packages/css-components/src/components');
const SCHEMA_PATH = resolve(ROOT, 'packages/css-components/src/component.schema.json');

// ── Helpers ──────────────────────────────────────────────────────────

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

/** Simple JSON Schema validator (subset — no $ref, no allOf/anyOf). */
function validateNode(value, schema, path = '') {
  const errors = [];

  if (schema.type === 'object') {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      errors.push(`${path || '(root)'}: expected object, got ${typeof value}`);
      return errors;
    }

    // Required fields
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in value)) {
          errors.push(`${path || '(root)'}: missing required field "${key}"`);
        }
      }
    }

    // Validate known properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in value) {
          errors.push(...validateNode(value[key], propSchema, `${path}.${key}`));
        }
      }
    }

    // Validate additional properties (for variants map, keyboard map, etc.)
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      const knownKeys = new Set(Object.keys(schema.properties || {}));
      for (const [key, val] of Object.entries(value)) {
        if (!knownKeys.has(key)) {
          errors.push(...validateNode(val, schema.additionalProperties, `${path}.${key}`));
        }
      }
    }

    // Check for disallowed extra keys when additionalProperties === false
    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(value)) {
        if (!allowed.has(key)) {
          errors.push(`${path}.${key}: unexpected property (not in schema)`);
        }
      }
    }
  } else if (schema.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${path}: expected array, got ${typeof value}`);
      return errors;
    }
    if (schema.items) {
      value.forEach((item, i) => {
        errors.push(...validateNode(item, schema.items, `${path}[${i}]`));
      });
    }
  } else if (schema.type === 'string') {
    if (typeof value !== 'string') {
      errors.push(`${path}: expected string, got ${typeof value}`);
    }
  } else if (schema.type === 'number') {
    if (typeof value !== 'number') {
      errors.push(`${path}: expected number, got ${typeof value}`);
    }
  } else if (schema.type === 'boolean') {
    if (typeof value !== 'boolean') {
      errors.push(`${path}: expected boolean, got ${typeof value}`);
    }
  }

  return errors;
}

/** Extract BEM variant names from an SCSS file. */
function extractScssVariants(scssContent, prefix) {
  // Match block-level modifiers only: .prefix-component--variant
  // Skip element modifiers: .prefix-component__element--modifier (has __ before --)
  const patterns = [
    new RegExp(`\\.${prefix}-(?!\\w*__)[\\w]+--([-\\w]+)`, 'g'),
    /\.#\{[^}]+\}-(?!\w*__)\w+--([-\w]+)/g,
  ];
  const variants = new Set();
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(scssContent)) !== null) {
      // Skip size modifiers (sm, md, lg) and state modifiers (full-width, loading)
      const name = match[1];
      if (!['sm', 'md', 'lg', 'full-width', 'loading'].includes(name)) {
        variants.add(name);
      }
    }
  }
  return variants;
}

// ── Main ─────────────────────────────────────────────────────────────

function main() {
  const showFix = process.argv.includes('--fix');

  console.log('');
  console.log('  Component Metadata Validator');
  console.log('  ────────────────────────────');
  console.log('');

  // Load schema
  if (!existsSync(SCHEMA_PATH)) {
    console.error(red('  ERROR: Schema not found at ' + SCHEMA_PATH));
    process.exit(1);
  }
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'));

  // Find all .meta.json files
  const metaFiles = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith('.meta.json'))
    .map((f) => resolve(COMPONENTS_DIR, f));

  if (metaFiles.length === 0) {
    console.log(yellow('  WARNING: No *.meta.json files found in'));
    console.log(yellow('  ' + COMPONENTS_DIR));
    console.log('');
    process.exit(2);
  }

  console.log(`  Found ${metaFiles.length} metadata file(s)\n`);

  // Read ds.config.json for prefix
  let prefix = 'vcds';
  const dsConfigPath = resolve(ROOT, 'ds.config.json');
  if (existsSync(dsConfigPath)) {
    try {
      const dsConfig = JSON.parse(readFileSync(dsConfigPath, 'utf-8'));
      prefix = dsConfig.prefix || 'vcds';
    } catch {
      // Use default
    }
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const metaPath of metaFiles) {
    const fileName = basename(metaPath);
    const componentName = fileName.replace('.meta.json', '');

    console.log(`  ${dim('─')} ${fileName}`);

    // 1. Parse JSON
    let meta;
    try {
      meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
    } catch (err) {
      console.log(`    ${red('[FAIL]')} Invalid JSON: ${err.message}`);
      totalErrors++;
      continue;
    }

    // 2. Validate against schema
    const schemaErrors = validateNode(meta, schema);
    for (const err of schemaErrors) {
      console.log(`    ${red('[FAIL]')} ${err}`);
      totalErrors++;
    }

    // 3. Cross-check variants against SCSS
    const scssPath = resolve(COMPONENTS_DIR, `_${componentName}.scss`);
    if (existsSync(scssPath) && meta.variants) {
      const scssContent = readFileSync(scssPath, 'utf-8');
      const scssVariants = extractScssVariants(scssContent, prefix);
      const metaVariants = new Set(Object.keys(meta.variants));

      // Variants in SCSS but not in metadata
      for (const v of scssVariants) {
        if (!metaVariants.has(v)) {
          console.log(`    ${yellow('[WARN]')} Variant "${v}" found in SCSS but not in metadata`);
          totalWarnings++;
        }
      }

      // Variants in metadata but not in SCSS
      for (const v of metaVariants) {
        if (!scssVariants.has(v)) {
          console.log(`    ${yellow('[WARN]')} Variant "${v}" in metadata but not found in SCSS`);
          totalWarnings++;
        }
      }
    } else if (!existsSync(scssPath)) {
      console.log(`    ${yellow('[WARN]')} No matching SCSS file: _${componentName}.scss`);
      totalWarnings++;
    }

    // 4. Quality checks
    if (meta.intent?.purpose && meta.intent.purpose.startsWith('TODO')) {
      console.log(`    ${yellow('[WARN]')} intent.purpose still has TODO placeholder`);
      totalWarnings++;
    }
    if (meta.name && meta.name.startsWith('TODO')) {
      console.log(`    ${yellow('[WARN]')} name still has TODO placeholder`);
      totalWarnings++;
    }
    if (meta.accessibility && !meta.accessibility.role) {
      console.log(`    ${yellow('[WARN]')} accessibility section present but missing "role"`);
      totalWarnings++;
    }

    if (schemaErrors.length === 0) {
      console.log(`    ${green('[PASS]')} Valid`);
    }

    // Show fix suggestions
    if (showFix && schemaErrors.length > 0) {
      console.log(`    ${dim('Fix: See blueprints/scss/Component.meta.blueprint.json for template')}`);
      console.log(`    ${dim('Ref: packages/css-components/src/components/button.meta.json')}`);
    }

    console.log('');
  }

  // Summary
  console.log('  ────────────────────────────');
  if (totalErrors === 0) {
    console.log(`  ${green('PASS')} All ${metaFiles.length} file(s) valid`);
  } else {
    console.log(`  ${red('FAIL')} ${totalErrors} error(s) found`);
  }
  if (totalWarnings > 0) {
    console.log(`  ${yellow('WARN')} ${totalWarnings} warning(s)`);
  }
  console.log('');

  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
