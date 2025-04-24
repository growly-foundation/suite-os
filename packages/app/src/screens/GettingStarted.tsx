import Dashboard from './Dashboard';
import { useAccount } from 'wagmi';
import Connect from './Connect';
import { getJsonCacheData } from '../../lib/core/helpers';
import MultichainOnboarding from './MultichainOnboarding';
import { MULTICHAIN_DATA_READY } from '../../lib/core/constants';
import { useMultichainMagic } from '../../lib/core/hooks';
import { ThreeStageState } from '../../lib/core/types';

const GettingStarted = () => {
  const { isConnected, address } = useAccount();
  const {
    query: { stateCheck },
  } = useMultichainMagic();

  if (!isConnected || !address) return <Connect />;

  const [key] = MULTICHAIN_DATA_READY(address);
  if (!getJsonCacheData(key)?.data || stateCheck('GetMultichainData', ThreeStageState.Finished))
    return <MultichainOnboarding />;

  return <Dashboard />;
};

export default GettingStarted;
