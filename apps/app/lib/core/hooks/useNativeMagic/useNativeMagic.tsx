import { calculateMultichainTokenPortfolio } from 'chainsmith-sdk/utils';
import { delayMs, setState } from '../../utils';
import { BinaryState, StateEvent, ThreeStageState } from '../../types/state.type';
import { useNativeMagicContext } from './useNativeMagicContext';
import { TAddress } from 'chainsmith-sdk/types';
import { SonicChainApiService } from '../../services';
import { buildCachePayload, getRevalidatedJsonData } from '../../helpers';
import { useAsyncDispatch } from '..';
import { NATIVE_NFT_PORTFOLIO, NATIVE_POINTS } from '../../constants';

export const NativeStateSubEvents = {
  [StateEvent.ActivityStats]: ThreeStageState,
  [StateEvent.GetAddress]: BinaryState,
  [StateEvent.GetTokenPortfolio]: ThreeStageState,
  [StateEvent.GetNftPortfolio]: ThreeStageState,
  [StateEvent.GetTokenActivity]: ThreeStageState,
  [StateEvent.GetNftActivity]: ThreeStageState,
  [StateEvent.GetOnchainScore]: ThreeStageState,
};

const service = new SonicChainApiService();

export const useNativeMagic = () => {
  const {
    stateEvents,
    setStateEvents,
    // Raw
    tokenPortfolio,
    sonicPoints,
    nftPortfolio,

    // Insights
    tokenPortfolioStats,
    nativeProtocolData,
  } = useNativeMagicContext();
  const { newAsyncDispatch, stateCheck, dispatchStateEvent } = useAsyncDispatch(
    NativeStateSubEvents,
    [stateEvents, setStateEvents]
  );

  const fetchTokenPortfolio = async (addressInput: TAddress, hardRefresh?: boolean) => {
    const cachedTokenPortfolio = await getRevalidatedJsonData(
      `${addressInput}.tokenPortfolio`,
      async () => {
        return newAsyncDispatch(
          StateEvent.GetTokenPortfolio,
          {
            onStartEvent: NativeStateSubEvents.GetTokenPortfolio.InProgress,
            onErrorEvent: {
              value: NativeStateSubEvents.GetTokenPortfolio.Idle,
              toast: 'Failed to fetch multichain token portfolio.',
            },
            onFinishEvent: {
              value: NativeStateSubEvents.GetTokenPortfolio.Finished,
              toast: 'Fetched token portfolio.',
            },
            onResetEvent: NativeStateSubEvents.GetTokenPortfolio.Idle,
          },
          async () => {
            const tokenPortfolio = await service.getWalletTokenPortfolio(addressInput);
            return buildCachePayload(tokenPortfolio, 1000 * 60 * 60 * 5);
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

  const fetchPoints = async (addressInput: TAddress) => {
    const [key, expiration] = NATIVE_POINTS(addressInput);
    const points = await getRevalidatedJsonData(key, async () => {
      return newAsyncDispatch(
        StateEvent.GetOnchainScore,
        {
          onStartEvent: NativeStateSubEvents.GetOnchainScore.InProgress,
          onErrorEvent: {
            value: NativeStateSubEvents.GetOnchainScore.Idle,
            toast: 'Failed to fetch Sonic points.',
          },
          onFinishEvent: {
            value: NativeStateSubEvents.GetOnchainScore.Finished,
            toast: 'Fetched Sonic points successfully.',
          },
          onResetEvent: NativeStateSubEvents.GetOnchainScore.Idle,
        },
        async () => buildCachePayload(await service.getPointStats(addressInput), expiration)
      );
    });
    if (points) {
      setState(sonicPoints)(points);
    }
  };

  const fetchNftBalances = async (addressInput: TAddress) => {
    const [key, expiration] = NATIVE_NFT_PORTFOLIO(addressInput);
    const collectibles = await getRevalidatedJsonData(key, async () => {
      return newAsyncDispatch(
        StateEvent.GetNftPortfolio,
        {
          onStartEvent: NativeStateSubEvents.GetNftPortfolio.InProgress,
          onErrorEvent: {
            value: NativeStateSubEvents.GetNftPortfolio.Idle,
            toast: 'Failed to fetch NFT portfolio.',
          },
          onFinishEvent: {
            value: NativeStateSubEvents.GetNftPortfolio.Finished,
            toast: 'Fetched NFT portfolio successfully.',
          },
          onResetEvent: NativeStateSubEvents.GetNftPortfolio.Idle,
        },
        async () => {
          const collectibles = await service.getNftCollectibles(addressInput);
          return buildCachePayload(collectibles, expiration);
        }
      );
    });
    if (collectibles) {
      setState(nftPortfolio)(collectibles);
    }
  };

  const letsDoSomeMagic = async (addressInput: TAddress | undefined, hardRefresh?: boolean) => {
    try {
      if (addressInput) {
        await fetchTokenPortfolio(addressInput, hardRefresh);
        await fetchPoints(addressInput);
        await fetchNftBalances(addressInput);
        await delayMs(1000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProtocolData = async () => {
    setState(nativeProtocolData)({
      anglesMarketData: await service.getAngles(),
      beetsPools: await service.getBeetsPools(),
      metropolisProtocolStatistics: await service.getMetropolisProtocolStatistics(),
      metropolisVaults: await service.getMetropolisVaults(),
      shadowMixedPairs: await service.getShadowMixedPairs(),
      shadowStatistics: await service.getShadowStatistics(),
      siloMarkets: await service.getSiloMarkets(),
      siloMetrics: await service.getSiloMetrics(),
      stakedSonicMarket: await service.getStakedSonicMarket(),
      metropolisPools: await service.getV21Pools(),
    });
  };

  return {
    query: {
      fetchTokenPortfolio,
      fetchProtocolData,
      stateCheck,
    },
    mutate: {
      letsDoSomeMagic,
      dispatchStateEvent,
      newAsyncDispatch,
    },
  };
};
