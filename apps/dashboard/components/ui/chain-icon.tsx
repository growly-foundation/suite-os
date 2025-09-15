import { cn } from '@/lib/utils';
import Image from 'next/image';
import { base, mainnet, optimism } from 'viem/chains';

import { TChainId } from '@getgrowly/chainsmith/types';
import { getChainNameById } from '@getgrowly/chainsmith/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export function ChainIcon({
  chainIds,
  className,
  showTooltip = false,
  iconPixel = 18,
}: {
  chainIds: TChainId[];
  className?: string;
  showTooltip?: boolean;
  iconPixel?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {chainIds.map(chainId => (
        <Tooltip key={chainId}>
          <TooltipTrigger>
            <div
              className={cn(
                'flex items-center justify-center rounded-[5px] bg-[var(--color-bob-tag-neutral)] w-6 h-6',
                className
              )}>
              {mapChainIdToIcon(chainId, iconPixel)}
            </div>
          </TooltipTrigger>
          {showTooltip && (
            <TooltipContent className="text-foreground">{getChainNameById(chainId)}</TooltipContent>
          )}
        </Tooltip>
      ))}
    </div>
  );
}

export function MultiChainIcon({
  chainIds,
  showTooltip = true,
  className,
  iconSize = 20,
  topOffset = '0px',
}: {
  chainIds: TChainId[];
  showTooltip?: boolean;
  className?: string;
  iconSize?: number;
  topOffset?: string;
}) {
  if (!chainIds || chainIds.length === 0) {
    return null;
  }

  return (
    <div
      className={`relative flex items-center ${className ?? ''}`}
      style={{
        width: `${chainIds.length * (iconSize * 0.6) + iconSize * 0.4}px`,
        height: `${iconSize}px`,
      }}>
      {chainIds.map((chainId, index) => (
        <div
          key={chainId}
          className="absolute flex items-center justify-center"
          style={{
            left: `${index * (iconSize * 0.4)}px`,
            top: topOffset,
            zIndex: chainIds.length - index, // Higher index = higher z-index
          }}>
          <ChainIcon
            chainIds={[chainId]}
            showTooltip={showTooltip}
            className={cn(
              'bg-transparent',
              iconSize === 20 ? 'w-5 h-5' : iconSize === 16 ? 'w-4 h-4' : 'w-6 h-6'
            )}
          />
        </div>
      ))}
    </div>
  );
}

const mapChainIdToIcon = (chainId: TChainId, iconPixel = 18): React.ReactNode => {
  switch (chainId) {
    case mainnet.id:
      return (
        <Image
          src="/logos/chains/ethereum-logo.svg"
          alt="Mainnet"
          width={iconPixel}
          height={iconPixel}
        />
      );
    case base.id:
      return (
        <Image src="/logos/chains/base-logo.svg" alt="Base" width={iconPixel} height={iconPixel} />
      );
    case optimism.id:
      return (
        <Image
          src="/logos/chains/optimism-logo.png"
          alt="Optimism"
          width={iconPixel}
          height={iconPixel}
        />
      );
  }
};
