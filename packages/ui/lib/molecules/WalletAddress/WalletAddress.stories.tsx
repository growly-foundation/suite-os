import type { Meta, StoryObj } from '@storybook/react';

import WalletAddress from './WalletAddress';
import { Wallets } from 'chainsmith-sdk/data';

const meta: Meta<typeof WalletAddress> = {
  component: WalletAddress,
};

export default meta;

type Story = StoryObj<typeof WalletAddress>;

export const Default: Story = {
  args: {
    address: Wallets.LOCAL_TEST_WALLET_1,
    truncatedLength: 10,
    truncated: true,
  },
};
