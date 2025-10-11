import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_CHAINS } from '@/core/chains';
import type { Chain } from 'viem';

import { ChainIcon } from '../ui/chain-icon';

export const ChainSelector = ({
  value,
  onChange,
  supportedChainIds,
}: {
  value: Chain['id'];
  onChange: (value: Chain['id']) => void;
  supportedChainIds?: number[];
}) => {
  // Check if chains are configured
  const hasConfiguredChains = supportedChainIds && supportedChainIds.length > 0;

  // Filter chains based on organization configuration
  const availableChains = hasConfiguredChains
    ? SUPPORTED_CHAINS.filter(chain => supportedChainIds.includes(chain.id))
    : [];

  // If no chains are configured, show disabled state
  if (!hasConfiguredChains) {
    return (
      <Select disabled>
        <SelectTrigger id="chain-id" className="opacity-50 cursor-not-allowed">
          <SelectValue placeholder="Configure chains in settings first" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value.toString()} onValueChange={value => onChange(Number(value))}>
      <SelectTrigger id="chain-id">
        <SelectValue placeholder="Select a chain" />
      </SelectTrigger>
      <SelectContent>
        {availableChains.map(chain => (
          <SelectItem value={chain.id.toString()} key={chain.id}>
            <div className="flex items-center gap-2">
              <ChainIcon chainIds={[chain.id]} />
              {chain.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
