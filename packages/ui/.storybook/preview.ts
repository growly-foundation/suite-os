import type { Preview } from '@storybook/react';
import { fn } from '@storybook/test';

import '../lib/style.css';

const preview: Preview = {
  parameters: {
    actions: { onclick: fn(), onchange: fn() },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
