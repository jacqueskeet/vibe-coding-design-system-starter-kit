import React from 'react';
import type { Decorator } from '@storybook/react';
import { ComponentMetadata } from '../../src/components/ComponentMetadata';

/**
 * Storybook decorator that automatically renders ComponentMetadata
 * when a story sets `parameters.componentMetadata`.
 *
 * Usage in a story file:
 * ```ts
 * import buttonMeta from '@vcds/css-components/components/button.meta.json';
 *
 * const meta = {
 *   title: 'Components/Button',
 *   component: Button,
 *   parameters: {
 *     componentMetadata: buttonMeta,
 *   },
 * } satisfies Meta<typeof Button>;
 * ```
 *
 * The metadata will render below the story canvas in the docs page.
 */
export const withComponentMetadata: Decorator = (Story, context) => {
  const metadata = context.parameters?.componentMetadata;

  return (
    <>
      <Story />
      {metadata && (
        <div style={{ marginTop: '32px', borderTop: '1px solid #e9ecef', paddingTop: '24px' }}>
          <ComponentMetadata metadata={metadata} />
        </div>
      )}
    </>
  );
};

export default withComponentMetadata;
