import { countExistentialObject, iterateObject } from 'chainsmith-sdk/utils';
import { TChainEcosystem, TChainName, TMultiEcosystem } from 'chainsmith-sdk/types';
import React, { useState } from 'react';
import { Atoms, Molecules } from '@/ui';
import pluralize from 'pluralize';
import ChainIcon from '../ChainIcon/ChainIcon';

type Props = {
  selectedNetworks: TMultiEcosystem<TChainName[]>;
  onNetworkSelected: (ecosystem: TChainEcosystem, chains: TChainName[]) => void;
};

const SelectNetworkButton = ({ selectedNetworks, onNetworkSelected }: Props) => {
  const [openChainList, setOpenChainList] = useState<boolean>(false);
  const defaultEcosystemChains = (selectedNetworks['evm'] || []).reduce<Record<string, true>>(
    (acc, item) => {
      acc[item] = true;
      return acc;
    },
    {}
  );
  return (
    <React.Fragment>
      {countExistentialObject(selectedNetworks) > 0 ? (
        <div className="flex flex-col items-center">
          {iterateObject(selectedNetworks, (network, chains) => (
            <Atoms.Button className="rounded-3xl shadow-md" onClick={() => setOpenChainList(true)}>
              {network.toUpperCase()}: {chains.length} {pluralize('chain', chains.length)} selected
            </Atoms.Button>
          ))}
          <div className="flex gap-2 justify-even mt-3">
            {(selectedNetworks['evm'] || []).map(chainName => (
              <ChainIcon size={20} chainName={chainName} />
            ))}
          </div>
        </div>
      ) : (
        <Atoms.Button onClick={() => setOpenChainList(true)}>Select your network</Atoms.Button>
      )}
      {openChainList && (
        <Molecules.ChainListModal
          open={true}
          ecosystemDisabled
          defaultEcosystem="evm"
          defaultChains={defaultEcosystemChains}
          handleOnClick={(...props) => {
            onNetworkSelected(...props);
            setOpenChainList(false);
          }}
          handleOpen={() => setOpenChainList(false)}
        />
      )}
    </React.Fragment>
  );
};

export default SelectNetworkButton;
