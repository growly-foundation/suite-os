import type { Meta, StoryObj } from '@storybook/react';

import Empty from './Empty';

const meta: Meta<typeof Empty> = {
  component: Empty,
};

export default meta;

type Story = StoryObj<typeof Empty>;

export const Default: Story = {
  args: {
    title: 'No data found',
    subtitle: 'There is no data found',
  },
};
