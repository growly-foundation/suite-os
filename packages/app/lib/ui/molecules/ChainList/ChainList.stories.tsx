import type { Meta, StoryObj } from '@storybook/react';

import ChainList from './ChainList';

const meta: Meta<typeof ChainList> = {
  component: ChainList,
};

export default meta;

type Story = StoryObj<typeof ChainList>;

export const Default: Story = {
  args: {
    searchQuery: {
      chainName: 'mainnet',
    },
    ecosystem: 'evm',
  },
};
