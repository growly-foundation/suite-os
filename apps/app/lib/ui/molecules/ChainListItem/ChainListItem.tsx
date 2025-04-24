import { TChain } from 'chainsmith-sdk/types';
import clsx from 'clsx';
import ChainIcon from '../ChainIcon/ChainIcon';

interface Props {
  chain: TChain;
  highlighted?: boolean;
}

export default ({ chain, highlighted }: Props) => {
  return (
    <div
      key={`${chain.id}-${chain.name}`}
      className={clsx([
        highlighted ? 'bg-purple-100' : 'hover:bg-gray-200',
        'cursor-pointer',
        'py-2 px-2 flex items-center',
        'rounded-xl',
      ])}>
      <ChainIcon chainName={chain.chainName} />
      <div className="ml-2">
        {chain.name} ({chain.nativeCurrency.symbol})
      </div>
    </div>
  );
};
