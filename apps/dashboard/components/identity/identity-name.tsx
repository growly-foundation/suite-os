'use client';

import { CopyTooltip } from '@/components/ui/copy-tooltip';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { Address } from 'viem';

export interface IdentityNameProps {
  address: Address;
  className?: string;
  name?: string; // Optional override
  fallback?: React.ReactNode; // What to show if no name
  showLoading?: boolean;
  showTooltip?: boolean; // Whether to show tooltip with copy functionality
}

export const IdentityName = ({
  address,
  className,
  name: nameProp,
  fallback = null,
  showLoading = false,
  showTooltip = true,
  ...props
}: IdentityNameProps & React.HTMLAttributes<HTMLSpanElement>) => {
  // Only fetch name if not provided as prop
  const { data: identityData, isLoading } = trpc.persona.getAggregatedIdentity.useQuery(address, {
    enabled: !nameProp && !!address,
    staleTime: 5 * 60 * 1000,
  });

  const finalName = nameProp || identityData?.mainnet.name || identityData?.base.name;

  if (isLoading && showLoading && !nameProp) {
    return <span className={cn('animate-pulse bg-muted rounded h-4 w-20', className)} {...props} />;
  }

  if (!finalName) {
    return <>{fallback}</>;
  }

  const nameElement = (
    <span className={cn('font-medium', className)} {...props}>
      {finalName}
    </span>
  );

  // If showTooltip is true and we have a name (meaning it's an ENS name), wrap with CopyTooltip
  if (showTooltip && finalName) {
    return (
      <CopyTooltip
        textToCopy={address}
        side="top"
        className="hover:underline transition-all duration-200">
        {nameElement}
      </CopyTooltip>
    );
  }

  return nameElement;
};
