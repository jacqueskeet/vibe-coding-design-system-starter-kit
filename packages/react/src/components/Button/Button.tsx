import { forwardRef } from 'react';
import type { ButtonProps } from './Button.types';
import { DS_PREFIX, cls } from '@vcds/shared/prefix';

/**
 * Button — Primary interactive element for triggering actions.
 *
 * Styles come from @vcds/css-components (BEM classes with configurable prefix).
 * Prefix is defined in /ds.config.json — change with: node scripts/set-prefix.js
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Save changes
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      iconLeft,
      iconRight,
      children,
      className,
      disabled,
      onClick,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const classNames = [
      cls('button'),
      cls('button', variant),
      cls('button', size),
      fullWidth ? cls('button', 'full-width') : '',
      isLoading ? cls('button', 'loading') : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        aria-disabled={isDisabled || undefined}
        aria-busy={isLoading || undefined}
        onClick={isDisabled ? undefined : onClick}
        {...rest}
      >
        {isLoading && (
          <span className={cls('button', null, 'spinner')} aria-hidden="true">
            <svg
              className={cls('button', null, 'spinner-icon')}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.42 31.42"
              />
            </svg>
          </span>
        )}

        {iconLeft && !isLoading && (
          <span className={cls('button', null, 'icon-left')} aria-hidden="true">
            {iconLeft}
          </span>
        )}

        <span className={isLoading ? `${cls('button', null, 'label')}--hidden` : cls('button', null, 'label')}>
          {children}
        </span>

        {isLoading && (
          <span className={cls('button', null, 'sr-only')}>Loading</span>
        )}

        {iconRight && (
          <span className={cls('button', null, 'icon-right')} aria-hidden="true">
            {iconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
