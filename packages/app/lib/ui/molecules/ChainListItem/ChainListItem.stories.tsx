import type { Meta, StoryObj } from '@storybook/react';

import ChainListItem from './ChainListItem';
import { wrapper } from 'chainsmith-sdk';
import { Chains } from 'chainsmith-sdk/data';

const meta: Meta<typeof ChainListItem> = {
  component: ChainListItem,
};

export default meta;

type Story = StoryObj<typeof ChainListItem>;

export const Default: Story = {
  args: {
    chain: new wrapper.ChainTypeBuilder(Chains.EvmChainList.mainnet).withEcosystem('evm').build(),
  },
};
