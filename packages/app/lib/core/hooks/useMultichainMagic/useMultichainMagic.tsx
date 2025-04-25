import { calculateMultichainTokenPortfolio } from 'chainsmith-sdk/utils';
import { calculateMultichainNFTPortfolio, delayMs, selectState, setState } from '../../utils';
import { BinaryState, StateEvent, ThreeStageState } from '../../types/state.type';
import { useMultichainMagicContext } from './useMultichainMagicContext';
import { TAddress, TChainName } from 'chainsmith-sdk/types';
import { EvmApiService } from '../../services';
import { buildCachePayload, getRevalidatedJsonData } from '../../helpers';
import { useAsyncDispatch } from '..';
import {
  MULTICHAIN_ACTIVITY_STATS,
  MULTICHAIN_DATA_READY,
  MULTICHAIN_NFT_ACTIVITY_DATA,
  MULTICHAIN_NFT_BALANCES,
  MULTICHAIN_TOKEN_PORTFOLIO,
} from '../../constants';

const service = new EvmApiService();

export const MultichainEvent = {
  [StateEvent.ActivityStats]: ThreeStageState,
  [StateEvent.GetAddress]: BinaryState,
  [StateEvent.GetTokenPortfolio]: ThreeStageState,
  [StateEvent.GetNftPortfolio]: ThreeStageState,
  [StateEvent.GetTokenActivity]: ThreeStageState,
  [StateEvent.GetNftActivity]: ThreeStageState,
  [StateEvent.GetTalentScore]: BinaryState,
  [StateEvent.GetMultichainData]: ThreeStageState,
};

export const useMultichainMagic = () => {
  const {
    stateEvents,
    setStateEvents,
    selectedNetworks,
    // Raw
    allTransactions,
    tokenPortfolio,
    nftPortfolio,
    nftActivity,

    // Insights
    chainStats,
    activityStats,
    tokenPortfolioStats,
    totalGasInETH,
    nftPortfolioStats,
    nftActivityStats,
  } = useMultichainMagicContext();

  const { newAsyncDispatch, stateCheck, dispatchStateEvent } = useAsyncDispatch(MultichainEvent, [
    stateEvents,
    setStateEvents,
  ]);

  const getNetworks = () => selectState(selectedNetworks)['evm'] || [];

  const fetchActivityStats = async (addressInput: TAddress, networks: TChainName[]) => {
    const [key, expiration] = MULTICHAIN_ACTIVITY_STATS(addressInput);
    const stats = await getRevalidatedJsonData(key, async () => {
      return newAsyncDispatch(
        StateEvent.ActivityStats,
        {
          onStartEvent: MultichainEvent.ActivityStats.InProgress,
          onErrorEvent: { value: MultichainEvent.ActivityStats.Idle },
          onFinishEvent: {
            value: MultichainEvent.ActivityStats.Finished,
            toast: 'Activity stats fetched.',
          },
          onResetEvent: MultichainEvent.ActivityStats.Idle,
        },
        async () => {
          const activityStats = await service.fetchActivityStats(addressInput, networks);
          return buildCachePayload(activityStats, expiration);
        }
      );
    });
    if (stats) {
      setState(allTransactions)(stats.multichainTxs);
      setState(totalGasInETH)(stats.totalGasInETH);
      setState(activityStats)(stats.activityStats);
      setState(chainStats)(stats.chainStats);
    }
    return stats;
  };

  const fetchMultichainTokenPortfolio = async (
    addressInput: TAddress,
    networks: TChainName[],
    hardRefresh?: boolean
  ) => {
    const [key, expiration] = MULTICHAIN_TOKEN_PORTFOLIO(addressInput);
    const cachedTokenPortfolio = await getRevalidatedJsonData(
      key,
      async () => {
        return newAsyncDispatch(
          StateEvent.GetTokenPortfolio,
          {
            onStartEvent: MultichainEvent.GetTokenPortfolio.InProgress,
            onErrorEvent: {
              value: MultichainEvent.GetTokenPortfolio.Idle,
              toast: 'Failed to fetch multichain token portfolio.',
            },
            onFinishEvent: {
              value: MultichainEvent.GetTokenPortfolio.Finished,
              toast: 'Fetched token portfolio.',
            },
            onResetEvent: MultichainEvent.GetTokenPortfolio.Idle,
          },
          async () => {
            const tokenPortfolio = await service.getWalletTokenPortfolio(addressInput, networks);
            return buildCachePayload(tokenPortfolio, expiration);
          }
        );
      },
      {
        forceRefetch: hardRefresh,
      }
    );
    if (cachedTokenPortfolio) {
      setState(tokenPortfolio)(cachedTokenPortfolio);
      const _tokenPortfolioStats = calculateMultichainTokenPortfolio(cachedTokenPortfolio);
      setState(tokenPortfolioStats)(_tokenPortfolioStats);
    }
  };

  const fetchMultichainNftPortfolio = async (addressInput: TAddress, networks: TChainName[]) => {
    const [key, expiration] = MULTICHAIN_NFT_BALANCES(addressInput);
    const multichainNfts = await getRevalidatedJsonData(key, async () => {
      return newAsyncDispatch(
        StateEvent.GetNftPortfolio,
        {
          onStartEvent: MultichainEvent.GetNftPortfolio.InProgress,
          onErrorEvent: {
            value: MultichainEvent.GetNftPortfolio.Idle,
            toast: 'Failed to fetch NFT portfolio.',
          },
          onFinishEvent: {
            value: MultichainEvent.GetNftPortfolio.Finished,
            toast: 'Fetched NFT portfolio.',
          },
          onResetEvent: MultichainEvent.GetNftPortfolio.Idle,
        },
        async () => {
          return buildCachePayload(
            await service.getMultichainNftCollectibles(addressInput, networks),
            expiration
          );
        }
      );
    });
    if (multichainNfts) {
      const allNftBalances = Object.values(multichainNfts).flat();
      setState(nftPortfolio)(allNftBalances);
      const _nftPortfolio = calculateMultichainNFTPortfolio(allNftBalances);
      setState(nftPortfolioStats)(_nftPortfolio);
    }
  };

  const fetchMultichainNftActivity = async (addressInput: TAddress, networks: TChainName[]) => {
    const [key, expiration] = MULTICHAIN_NFT_ACTIVITY_DATA(addressInput);
    const activityData = await getRevalidatedJsonData(key, async () => {
      return newAsyncDispatch(
        StateEvent.GetNftActivity,
        {
          onStartEvent: MultichainEvent.GetNftActivity.InProgress,
          onErrorEvent: {
            value: MultichainEvent.GetNftActivity.Idle,
            toast: 'Failed to fetch multichain NFT activities.',
          },
          onFinishEvent: {
            value: MultichainEvent.GetNftActivity.Finished,
            toast: 'Fetched NFT activities.',
          },
          onResetEvent: MultichainEvent.GetNftActivity.Idle,
        },
        async () => {
          return buildCachePayload(
            await service.fetchMultichainNftActivity(addressInput, networks),
            expiration
          );
        }
      );
    });
    if (activityData) {
      setState(nftActivity)(activityData.allNftActivities);
      setState(nftActivityStats)(activityData.nftActivityStats);
    }
  };

  const fetchMultichainData = async (
    addressInput: TAddress | undefined,
    networks?: TChainName[],
    hardRefresh?: boolean
  ) => {
    const [key, expiration] = MULTICHAIN_DATA_READY(addressInput);
    return getRevalidatedJsonData(key, async () => {
      return newAsyncDispatch(
        StateEvent.GetMultichainData,
        {
          onStartEvent: MultichainEvent.GetMultichainData.InProgress,
          onErrorEvent: {
            value: MultichainEvent.GetMultichainData.Idle,
            toast: 'Failed to fetch multichain data.',
          },
          onFinishEvent: {
            value: MultichainEvent.GetMultichainData.Finished,
            toast: 'Fetched token portfolio.',
          },
          onResetEvent: MultichainEvent.GetMultichainData.Idle,
        },
        async () => {
          const _networks = networks || getNetworks();
          if (_networks.length > 0 && addressInput) {
            await fetchMultichainTokenPortfolio(addressInput, _networks, hardRefresh);
            await fetchActivityStats(addressInput, _networks);
            await fetchMultichainNftPortfolio(addressInput, _networks);
            await fetchMultichainNftActivity(addressInput, _networks);
            setStateEvents({
              ...stateEvents,
              [StateEvent.GetMultichainData]: ThreeStageState.Finished,
            });
            await delayMs(1000);
          }
          return buildCachePayload(true, expiration);
        }
      );
    });
  };

  return {
    query: {
      fetchActivityStats,
      fetchMultichainTokenPortfolio,
      stateCheck,
    },
    mutate: {
      fetchMultichainData,
      dispatchStateEvent,
      newAsyncDispatch,
    },
  };
};
