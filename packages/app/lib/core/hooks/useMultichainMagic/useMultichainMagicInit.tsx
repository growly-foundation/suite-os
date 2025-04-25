import { useMultichainMagic } from './useMultichainMagic';
import { useMultichainMagicContext } from './useMultichainMagicContext';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { selectState } from '../../utils';

export const useMultichainMagicInit = () => {
  const {
    mutate: { fetchMultichainData },
  } = useMultichainMagic();
  const { selectedNetworks } = useMultichainMagicContext();
  const { address } = useAccount();

  useEffect(() => {
    if (address) {
      fetchMultichainData(address);
    }
  }, [address, selectState(selectedNetworks)]);
};
