import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Chain } from 'viem';
import { base, mainnet } from 'viem/chains';

export const SUPPORTED_CHAINS: Chain[] = [mainnet, base];

export const ChainSelector = ({
  value,
  onChange,
}: {
  value: Chain['id'];
  onChange: (value: Chain['id']) => void;
}) => {
  return (
    <Select value={value.toString()} onValueChange={value => onChange(parseInt(value))}>
      <SelectTrigger id="chain-id">
        <SelectValue placeholder="Select chain" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CHAINS.map(chain => (
          <SelectItem key={chain.id} value={chain.id.toString()}>
            {chain.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
