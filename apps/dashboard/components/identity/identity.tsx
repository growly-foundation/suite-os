'use client';

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Address } from 'viem';

import { IdentityAvatar } from './identity-avatar';
import { IdentityCheckmark } from './identity-checkmark';
import { useIdentity } from './identity-context';
import { IdentityName } from './identity-name';
import { IdentityWalletAddress } from './identity-wallet-address';

export interface IdentityProps {
  address: Address;

  // Override data - if not provided, will be fetched automatically
  name?: string;
  avatar?: string;
  hasCheckmark?: boolean;

  // Layout options
  showAvatar?: boolean;
  showName?: boolean;
  showAddress?: boolean;
  showCheckmark?: boolean;
  // Tooltip options
  nameTooltip?: boolean;
  addressTooltip?: boolean;

  // Avatar options
  avatarSize?: number;
  withStatus?: boolean;
  userId?: string;

  // Address options
  truncateAddress?: boolean;
  truncateLength?: { startLength: number; endLength: number };

  // Checkmark options
  checkmarkSize?: { width: number; height: number };

  // Styling
  className?: string;
  avatarClassName?: string;
  nameClassName?: string;
  addressClassName?: string;

  // Layout
  layout?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
}

export const Identity = ({
  address,

  // Override data
  name: nameProp,
  avatar: avatarProp,
  hasCheckmark: hasCheckmarkProp = false,

  // Layout options
  showAvatar = true,
  showName = true,
  showAddress = true,
  showCheckmark = true,
  nameTooltip,
  addressTooltip,

  // Avatar options
  avatarSize = 20,
  withStatus = false,
  userId,

  // Address options
  truncateAddress = true,
  truncateLength = { startLength: 12, endLength: 4 },

  // Checkmark options
  checkmarkSize = { width: 12, height: 12 },

  // Styling
  className,
  avatarClassName,
  nameClassName,
  addressClassName,

  // Layout
  layout = 'horizontal',
  spacing = 'normal',
}: IdentityProps) => {
  // Determine if we actually need to fetch
  const needsFetchedName = !nameProp && showName;
  const needsFetchedAvatar = !avatarProp && showAvatar;
  const shouldFetch = needsFetchedName || needsFetchedAvatar;

  // Fetch ENS data only
  const { data: ensData, isLoading: ensLoading } = useIdentity(address);

  const isLoading = shouldFetch ? ensLoading : false;

  // Extract name and avatar from the data structure
  const fetchedName = ensData?.mainnet.name || ensData?.base.name || undefined;
  const fetchedAvatar = ensData?.mainnet.avatar || ensData?.base.avatar || undefined;

  // Final values passed to children so they don't fetch
  const name = nameProp ?? fetchedName ?? undefined;
  const avatar = avatarProp ?? fetchedAvatar ?? undefined;
  const hasCheckmark = hasCheckmarkProp || false;

  const isFetchingIdentity = isLoading && !nameProp && !avatarProp && !name;

  const spacingClasses = {
    tight: 'gap-1',
    normal: 'gap-2',
    loose: 'gap-3',
  };

  const layoutClasses = {
    horizontal: 'flex items-center',
    vertical: 'flex flex-col items-start',
  };

  return (
    <div className={cn(layoutClasses[layout], spacingClasses[spacing], className)}>
      {showAvatar && (
        <IdentityAvatar
          address={address}
          size={avatarSize}
          withStatus={withStatus}
          userId={userId}
          avatar={avatar}
          name={name}
          className={avatarClassName}
        />
      )}

      {(showName || showAddress || showCheckmark) && (
        <div className={cn('flex flex-col', layout === 'horizontal' ? 'min-w-0 flex-1' : 'w-full')}>
          {/* Name row - always show first, use ENS name or fallback to truncated address */}
          {showName && (
            <div className="flex items-center gap-2">
              {name ? (
                <IdentityName
                  address={address}
                  name={name}
                  className={cn('font-bold text-xs', nameClassName)}
                  showTooltip={nameTooltip}
                />
              ) : !showAddress ? (
                <IdentityWalletAddress
                  address={address}
                  truncate={truncateAddress}
                  truncateLength={truncateLength}
                  className={cn('text-xs hover:underline', addressClassName)}
                  showTooltip={addressTooltip}
                />
              ) : (
                // Show wallet address with bold font
                <IdentityWalletAddress
                  address={address}
                  truncate={truncateAddress}
                  truncateLength={truncateLength}
                  className={cn('text-foreground font-bold text-xs', nameClassName)}
                  showTooltip={addressTooltip}
                />
              )}

              {isFetchingIdentity && (
                <div className="h-2.5 w-2.5 p-0">
                  <Loader2 className="h-2 w-2 animate-spin text-muted-foreground" />
                </div>
              )}

              {showCheckmark && (
                <IdentityCheckmark
                  hasCheckmark={hasCheckmark}
                  width={checkmarkSize.width}
                  height={checkmarkSize.height}
                />
              )}
            </div>
          )}

          {/* Address row - only show if showAddress is true and we have a name (ENS) */}
          {showAddress && name && (
            <div className="flex items-center gap-2">
              <IdentityWalletAddress
                address={address}
                truncate={truncateAddress}
                truncateLength={truncateLength}
                className={cn('text-xs hover:underline', addressClassName)}
                showTooltip={addressTooltip}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Convenience components for common use cases
export const IdentityCompact = (
  props: Omit<IdentityProps, 'layout' | 'spacing' | 'avatarSize'>
) => <Identity {...props} layout="horizontal" spacing="tight" avatarSize={16} />;

export const IdentityFull = (props: Omit<IdentityProps, 'layout' | 'spacing' | 'avatarSize'>) => (
  <Identity {...props} layout="horizontal" spacing="normal" avatarSize={40} />
);

export const IdentityAvatarOnly = (
  props: Omit<IdentityProps, 'showName' | 'showAddress' | 'showCheckmark'>
) => <Identity {...props} showName={false} showAddress={false} showCheckmark={false} />;

export const IdentityNameOnly = (props: Omit<IdentityProps, 'showAvatar' | 'showAddress'>) => (
  <Identity {...props} showAvatar={false} showAddress={false} />
);

// Simple Identity component that only uses ENS data
export const IdentitySimple = (props: IdentityProps) => <Identity {...props} />;
