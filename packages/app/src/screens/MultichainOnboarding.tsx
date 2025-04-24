import { countExistentialObject, filterObject, getChainByName } from 'chainsmith-sdk/utils';
import {
  BackgroundChains,
  getJsonCacheData,
  setState,
  useMultichainMagic,
  useMultichainMagicContext,
} from '@/core';
import { Atoms, Molecules } from '@/ui';
import { useMemo, useState } from 'react';
import { TMultichain } from 'chainsmith-sdk/types';
import clsx from 'clsx';
import { useAccount } from 'wagmi';
import { buildCachePayload, storeJsonCacheData, SELECTED_NETWORKS } from '@/core';

const MultichainOnboarding = () => {
  const { address } = useAccount();
  const {
    mutate: { fetchMultichainData },
  } = useMultichainMagic();
  const { selectedNetworks } = useMultichainMagicContext();
  const [key, expiration] = useMemo(() => SELECTED_NETWORKS(address), [address]);
  const [currentSelectedNetworks, setCurrentSelectedNetworks] = useState<TMultichain<boolean>>(
    getJsonCacheData(key)?.data || {}
  );

  const handleSelectNetworks = async () => {
    storeJsonCacheData(key, buildCachePayload(currentSelectedNetworks, expiration));
    const _networks = filterObject(currentSelectedNetworks, item => item) as any;
    setState(selectedNetworks)(networks => ({
      ...networks,
      evm: _networks,
    }));
    await fetchMultichainData(address, _networks);
  };

  return (
    <div className="h-[100vh] flex flex-col items-center">
      <h1 className="font-bold text-3xl">Which chains have you experienced on?</h1>
      <p className="mt-5 text-2xl">
        You selected {countExistentialObject(currentSelectedNetworks)} networks
      </p>
      {countExistentialObject(currentSelectedNetworks) > 0 && (
        <Atoms.Button
          onClick={handleSelectNetworks}
          className="mt-5 shadow-xl"
          variant="solid"
          color="orange">
          👉 Start your journey on Cream!
        </Atoms.Button>
      )}
      <div className="flex flex-wrap max-w-[800px] items-center justify-center gap-5 mt-10">
        {BackgroundChains.map(chain => (
          <div
            onClick={() =>
              setCurrentSelectedNetworks({
                ...currentSelectedNetworks,
                [chain]: !currentSelectedNetworks[chain],
              })
            }
            className={clsx(
              'bg-white hover:font-bold shadow-md flex gap-3 rounded-xl rounded-xl py-5 px-7 hover:scale-110 cursor-pointer',
              currentSelectedNetworks[chain] && 'border font-bold border-slate-800'
            )}>
            <Molecules.ChainIcon chainName={chain} /> {getChainByName(chain).name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultichainOnboarding;
