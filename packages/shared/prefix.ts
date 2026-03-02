/**
 * Design System Prefix Configuration
 *
 * Single source of truth for the class name prefix used across
 * all framework packages. Kept in sync with /ds.config.json
 *
 * To change: run `node scripts/set-prefix.js <new-prefix>`
 */

export const DS_PREFIX = 'vcds';

/**
 * Helper to build a BEM class name with the configured prefix.
 *
 * @example
 * cls('button')                    → 'vcds-button'
 * cls('button', 'primary')         → 'vcds-button--primary'
 * cls('button', null, 'icon-left') → 'vcds-button__icon-left'
 */
export function cls(
  block: string,
  modifier?: string | null,
  element?: string | null
): string {
  let result = `${DS_PREFIX}-${block}`;
  if (element) result += `__${element}`;
  if (modifier) result += `--${modifier}`;
  return result;
}
