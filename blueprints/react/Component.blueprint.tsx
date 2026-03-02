/**
 * BLUEPRINT: React Component Wrapper (CSS-First Architecture)
 *
 * Thin wrapper — maps React props to BEM classes from @ds/css-components.
 * Uses DS_PREFIX from @ds/shared for the configurable prefix.
 * NO styles in this file.
 *
 * Steps:
 * 1. Ensure SCSS exists in packages/css-components/src/components/
 * 2. Copy this file to packages/react/src/components/{{ComponentName}}/
 * 3. Replace all {{placeholders}}
 * 4. Define props in {{ComponentName}}.types.ts
 */

import { forwardRef } from 'react';
import type { {{ComponentName}}Props } from './{{ComponentName}}.types';
import { cls } from '@ds/shared/prefix';

export const {{ComponentName}} = forwardRef<HTMLElement, {{ComponentName}}Props>(
  (
    {
      variant = 'default',
      size = 'md',
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const classNames = [
      cls('{{component-name}}'),
      cls('{{component-name}}', variant),
      cls('{{component-name}}', size),
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <element ref={ref} className={classNames} {...rest}>
        {children}
      </element>
    );
  }
);

{{ComponentName}}.displayName = '{{ComponentName}}';
