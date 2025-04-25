import { useMemo, useState } from 'react';
import { Button, Modal } from '../../atoms';
import { CircleCheck } from 'lucide-react';
import { Atoms } from '../..';
import ChainList from '../ChainList/ChainList';
import clsx from 'clsx';
import { countExistentialObject, filterObject } from 'chainsmith-sdk/utils';
import { LocalEcosystemRegistry, mustBeBoolean } from '@/core';
import { Chains } from 'chainsmith-sdk/data';
import type { TMultichain, TChainEcosystem, TChainName } from 'chainsmith-sdk/types';

type Props = {
  open: boolean;
  handleOpen: (open: boolean) => void;
  handleOnClick: (ecosystem: TChainEcosystem, chains: TChainName[]) => void;
  ecosystemDisabled?: boolean;
  defaultEcosystem?: TChainEcosystem;
  defaultChains?: TMultichain<boolean>;
};

const ChainListModal = ({
  open,
  handleOpen,
  handleOnClick,
  ecosystemDisabled,
  defaultEcosystem = 'evm',
  defaultChains = {},
}: Props) => {
  const [selectedChains, setSelectedChains] = useState<TMultichain<boolean>>(defaultChains);
  const [selectedEcosystem, setSelectedEcosystem] = useState<TChainEcosystem>(defaultEcosystem);
  const [chainNameSearch, setChainNameSearch] = useState<TChainName | ''>('');

  const selectedChainCount = useMemo(
    () => countExistentialObject(selectedChains),
    [selectedChains]
  );

  return (
    <Modal open={open} handleOpen={handleOpen}>
      <div className="min-h-[300px] min-w-[400px]">
        {!ecosystemDisabled && (
          <Atoms.Select
            value={selectedEcosystem}
            onValueChange={v => setSelectedEcosystem(v as TChainEcosystem)}
            options={Chains.Ecosystems.map(ecosystem => ({
              label: Chains.EcosystemRegistry[ecosystem]!.name,
              value: ecosystem,
            }))}
          />
        )}
        <ChainList
          className="mt-5"
          ecosystemRegistry={LocalEcosystemRegistry}
          ecosystem={selectedEcosystem}
          selectedChains={selectedChains}
          searchQuery={{
            chainName: chainNameSearch,
            onChainNameChanged: setChainNameSearch,
          }}
          onChainSelected={chain =>
            setSelectedChains({
              ...selectedChains,
              [chain]: !selectedChains[chain],
            })
          }
        />
        <Button
          onClick={() =>
            handleOnClick(selectedEcosystem, filterObject(selectedChains, mustBeBoolean) as any)
          }
          disabled={selectedChainCount === 0}
          className={clsx(
            'w-full mt-3 flex items-center rounded-xl justify-center',
            selectedChainCount > 0 && 'bg-black text-white'
          )}>
          <CircleCheck /> Select a network ({countExistentialObject(selectedChains)} selected)
        </Button>
        <Button
          onClick={() => handleOpen(false)}
          className="w-full bg-gray-100 mt-3 flex items-center rounded-xl justify-center">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ChainListModal;
