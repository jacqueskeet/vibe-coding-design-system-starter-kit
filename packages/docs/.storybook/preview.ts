import '@vcds/tokens/css';
import '@vcds/css-components';

import type { Preview } from '@storybook/react';
import { withComponentMetadata } from './decorators/withComponentMetadata';

const preview: Preview = {
  decorators: [withComponentMetadata],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
