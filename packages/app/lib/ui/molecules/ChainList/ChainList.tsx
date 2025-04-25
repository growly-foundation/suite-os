import Empty from '../../atoms/Empty/Empty';
import { Fragment, useEffect, useMemo, useState } from 'react';
import pluralize from 'pluralize';
import Fuse from 'fuse.js';
import ChainListItem from '../ChainListItem/ChainListItem';
import {
  TChainEcosystem,
  IEcosystemChainRegistry,
  TMultichain,
  TChainName,
} from 'chainsmith-sdk/types';
import { Card, Separator, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Chains } from 'chainsmith-sdk/data';
import { getChainByName } from 'chainsmith-sdk/utils';

type Props = {
  searchQuery: {
    chainName: TChainName | '';
    onChainNameChanged?: (chainName: TChainName | '') => void;
  };
  selectedChains: TMultichain<boolean>;
  onChainSelected?: (chain: TChainName) => void;
  ecosystem: TChainEcosystem;
  ecosystemRegistry: Partial<IEcosystemChainRegistry>;
  className?: string;
};

export default ({
  ecosystem = 'evm',
  ecosystemRegistry = Chains.EcosystemRegistry,
  selectedChains = {},
  searchQuery: { chainName = '', onChainNameChanged },
  onChainSelected,
  ...props
}: Props) => {
  const [ecosystemChainResults, setEcosystemChainResult] = useState<TChainName[]>([]);
  const ecosystemChains = useMemo(
    () => (ecosystemRegistry as any)[ecosystem]?.chains || [],
    [ecosystem, ecosystemRegistry]
  );

  useEffect(() => {
    const fuse = new Fuse(ecosystemChains, {
      shouldSort: true,
      includeMatches: false,
      minMatchCharLength: 1,
      threshold: 0.6,
      distance: 100,
      keys: ['name', 'id'],
    });

    const result = fuse.search(chainName);
    const chains = chainName.length > 0 ? result.map(r => r.item) : ecosystemChains;
    setEcosystemChainResult(chains as TChainName[]);
  }, [ecosystemChains, chainName]);

  return (
    <div {...props}>
      <TextField.Root
        value={chainName}
        className="rounded-xl"
        placeholder="Search chains by name..."
        onChange={e => onChainNameChanged && onChainNameChanged(e.target.value as any)}>
        <TextField.Slot className="py-2 px-3 rounded-xl">
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      {ecosystemChainResults.length > 0 ? (
        <Fragment>
          <h2 className="mb-3 mt-3 text-gray-600 text-center">
            There {pluralize('is', ecosystemChainResults.length)} {ecosystemChainResults.length}{' '}
            {pluralize('chain', ecosystemChainResults.length)} found
          </h2>
          <Separator />
          <Card className="max-h-[300px] overflow-scroll py-2 mt-3">
            {ecosystemChainResults
              .sort((chainA, chainB) => chainA.localeCompare(chainB))
              .map(chain => (
                <div className="my-1" onClick={() => onChainSelected && onChainSelected(chain)}>
                  <ChainListItem
                    chain={getChainByName(chain)}
                    highlighted={selectedChains[chain]}
                  />
                </div>
              ))}
          </Card>
        </Fragment>
      ) : (
        <Empty
          title="No networks found."
          subtitle="Please try again by selecting other ecosystems."
        />
      )}
    </div>
  );
};
