import { useEffect } from 'react';
import { useNativeMagic } from '.';
import { useAccount } from 'wagmi';

export const useNativeMagicInit = () => {
  const {
    mutate: { letsDoSomeMagic },
  } = useNativeMagic();
  const { address } = useAccount();

  useEffect(() => {
    const init = async () => {
      if (!address) return;
      letsDoSomeMagic(address);
    };
    init();
  }, [address]);
};
