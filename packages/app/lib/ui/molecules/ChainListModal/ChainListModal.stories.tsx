import type { Meta, StoryObj } from '@storybook/react';

import ChainListModal from './ChainListModal';

const meta: Meta<typeof ChainListModal> = {
  component: ChainListModal,
};

export default meta;

type Story = StoryObj<typeof ChainListModal>;

export const Default: Story = {
  args: {
    open: true,
  },
};
