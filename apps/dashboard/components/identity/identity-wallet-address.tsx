'use client';

import { cn } from '@/lib/utils';
import { Address } from 'viem';

import { WalletAddress } from '@getgrowly/ui';

import { CopyTooltip } from '../ui/copy-tooltip';

export interface IdentityWalletAddressProps {
  address: Address;
  truncate?: boolean;
  truncateLength?: { startLength: number; endLength: number };
  className?: string;
  showTooltip?: boolean;
}

export const IdentityWalletAddress = ({
  address,
  truncate = true,
  truncateLength = { startLength: 6, endLength: 4 },
  className,
  showTooltip = true,
  ...props
}: IdentityWalletAddressProps & React.HTMLAttributes<HTMLDivElement>) => {
  const walletAddress = (
    <WalletAddress
      address={address}
      truncate={truncate}
      truncateLength={truncateLength}
      className={cn('text-muted-foreground', className)}
      {...props}
    />
  );

  if (showTooltip) {
    return (
      <CopyTooltip
        textToCopy={address}
        side="top"
        className="hover:underline transition-all duration-200">
        {walletAddress}
      </CopyTooltip>
    );
  }

  return walletAddress;
};
