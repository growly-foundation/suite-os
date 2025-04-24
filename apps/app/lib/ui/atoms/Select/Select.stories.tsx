import type { Meta, StoryObj } from '@storybook/react';

import Select from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Defaul: Story = {
  args: {
    value: 'apple',
    options: [
      {
        label: 'apple',
        value: 'apple',
      },
      {
        label: 'orange',
        value: 'orange',
      },
      {
        label: 'lemon',
        value: 'lemon',
      },
    ],
  },
};
