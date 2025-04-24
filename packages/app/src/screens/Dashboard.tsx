import {
  formatNumberUSD,
  selectState,
  useNativeMagicContext,
  getJsonCacheData,
  useNativeMagic,
  useNativeMagicInit,
  formatNumberCompact,
  INVESTMENT_OBJECTIVES,
  SonicChainApiService,
} from '@/core';
import { Atoms, Molecules } from '@/ui';
import { ThreeStageState } from '@/core';
import React, { useEffect, useState } from 'react';
import animationData from '../assets/animation/pink-loading.json';
import Lottie from 'react-lottie';
import Countup from 'react-countup';
import { Badge, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { ArrowRightLeftIcon, RefreshCwIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { TAddress } from 'chainsmith-sdk/types';
import { CREAM_COLORS } from '../constants';
import { TSonicEcosystemApp } from 'chainsmith-sdk/plugins';

const Dashboard: React.FC<any> = () => {
  useNativeMagicInit();
  const { address } = useAccount();
  const {
    query: { stateCheck },
    mutate: { letsDoSomeMagic },
  } = useNativeMagic();
  const [key] = INVESTMENT_OBJECTIVES(address);
  const { tokenPortfolio, sonicPoints, nftPortfolio } = useNativeMagicContext();
  const [chatWithAiMessage, setChatWithAiMessage] = useState('');
  const [openObjectiveModal, setOpenObjectiveModal] = useState(!getJsonCacheData(key));

  const [apps, setApps] = useState<TSonicEcosystemApp[]>([]);
  console.log(apps);

  const service = new SonicChainApiService();

  async function getApps() {
    const apps = await service.getSonicActivePointsApps();
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = apps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [apps[i], apps[j]] = [apps[j], apps[i]];
    }

    // Return the first `count` elements (or fewer if not enough unique items)
    const recommendedApps = apps.slice(0, Math.min(3, apps.length));

    setApps(recommendedApps);
  }

  useEffect(() => {
    getApps();
  }, []);

  return (
    <React.Fragment>
      <div className="py-3 px-4 rounded-xl flex flex-col max-w-[80rem] shadow-xl w-full h-fit bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg mb-5">
        <div className="flex bg-white rounded-xl gap-z flex-wrap">
          <div className="rounded-lg flex gap-3 shadow-md w-full flex-wrap rounded-xl px-5 py-5">
            <div className="flex justify-between">
              <div className="mr-10">
                <div className="mb-2 mt-5 flex gap-3 items-center">
                  Total Balance{' '}
                  <RefreshCwIcon
                    size={12}
                    onClick={() => letsDoSomeMagic(address as TAddress, true)}
                  />
                </div>
                <h1 className="text-3xl font-bold">
                  <Countup
                    end={selectState(tokenPortfolio).totalUsdValue}
                    duration={3}
                    formattingFn={formatNumberUSD}
                  />
                </h1>
              </div>
              <div className="flex gap-3 items-center">
                <h1 className="text-5xl">🥇</h1>
                <div>
                  <h1 className="text-sm text-gray-500">#{selectState(sonicPoints)?.rank || 0}</h1>
                  <div>Ecosystem Points</div>
                  <h1 className="text-xl font-bold">
                    <Countup
                      end={selectState(sonicPoints)?.ecosystem_points || 0}
                      duration={3}
                      formattingFn={num => formatNumberCompact(num, 2)}
                    />
                  </h1>
                  <div className="flex gap-3 mt-3">
                    <Badge color="blue">
                      AP: {selectState(sonicPoints)?.active_liquidity_points}
                    </Badge>
                    <Badge color="green">
                      PP: {selectState(sonicPoints)?.passive_liquidity_points.toFixed(2)}
                    </Badge>
                    <Badge color="orange">
                      Multiplier x{selectState(sonicPoints)?.loyalty_multiplier}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {(selectState(sonicPoints)?.ecosystem_points || 0) < 100000 && (
                <div className="flex items-center">
                  <img src="badges/newbie-badge.png" width={100} />
                  <h1 className="font-bold">Newbie</h1>
                </div>
              )}
              {(selectState(sonicPoints)?.passive_liquidity_points || 0) > 100000 && (
                <div className="flex items-center">
                  <img src="badges/defichad-badge.png" width={100} />
                  <h1 className="font-bold">DeFi Chad</h1>
                </div>
              )}
              {(selectState(sonicPoints)?.active_liquidity_points || 0) > 100000 && (
                <div className="flex items-center">
                  <img src="badges/degen-badge.png" width={100} />
                  <h1 className="font-bold">Degen</h1>
                </div>
              )}
              {(selectState(sonicPoints)?.rank || 0) < 1000 && (
                <div className="flex items-center">
                  <img src="badges/og-badge.png" width={100} />
                  <h1 className="font-bold">OG</h1>
                </div>
              )}
              {selectState(nftPortfolio).length > 10 && (
                <div className="flex items-center">
                  <img src="badges/nftenthusiast-badge.png" width={100} />
                  <h1 className="font-bold">NFT Enthusiast</h1>
                </div>
              )}
            </div>
            {apps.length !== 0 && (
              <div>
                <a className="font-bold hover:text-orange-500" href={apps[0].website}>
                  <div className="flex items-center">
                    <img src={apps[0].image} width={30} />
                    <h1 className="font-bold pl-2">{apps[0].title}</h1>
                  </div>
                </a>

                <a className="font-bold hover:text-orange-500" href={apps[1].website}>
                  <div className="flex items-center pt-2">
                    <img src={apps[1].image} width={30} />
                    <h1 className="font-bold pl-2">{apps[1].title}</h1>
                  </div>
                </a>

                <a className="font-bold hover:text-orange-500" href={apps[2].website}>
                  <div className="flex items-center pt-2">
                    <img src={apps[2].image} width={30} />
                    <h1 className="font-bold pl-2">{apps[2].title}</h1>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="py-3 px-4 rounded-xl flex flex-col max-w-[80rem] shadow-xl w-full h-[100vh] bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg">
        <div className="py-5 px-7 rounded-xl flex flex-col shadow-xl w-full h-[100vh] bg-white">
          <ConnectButton />
          <div className="mt-7">
            <Atoms.Loadable
              isLoading={stateCheck('GetTokenPortfolio', ThreeStageState.InProgress)}
              loadComponent={
                <Lottie
                  options={{
                    loop: true,
                    autoplay: true,
                    animationData: animationData,
                    rendererSettings: {
                      preserveAspectRatio: 'xMidYMid slice',
                    },
                  }}
                  speed={2}
                  height={400}
                  width={400}
                />
              }>
              <div className="px-5">
                <div className="mb-5 flex gap-3">
                  <TextField.Root
                    value={chatWithAiMessage}
                    className="rounded-2xl min-w-[350px]"
                    placeholder="Speak with AI to manage portfolio better..."
                    onChange={e => setChatWithAiMessage(e.target.value as any)}>
                    <TextField.Slot className="py-2 px-3 rounded-xl">
                      <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                  </TextField.Root>
                  <Atoms.Button color="green" className="rounded-2xl" size="2">
                    Send Message
                  </Atoms.Button>
                </div>
                <div className="flex gap-3">
                  <Molecules.YieldFarmingButton
                    buttonProps={{ style: { background: CREAM_COLORS.ORANGE_FUR, color: 'white' } }}
                    tooltipContent="Maximize profits with yield farming">
                    👩‍🌾 Yield Farming
                  </Molecules.YieldFarmingButton>
                  <Molecules.SwapButton type="SWAP" tooltipContent="Cross-chain swapping tokens">
                    <ArrowRightLeftIcon size={10} /> Rebalance Portfolio
                  </Molecules.SwapButton>
                </div>
                <div className="mt-10 overflow-scroll max-h-[700px] pb-[15rem]">
                  {address &&
                  Object.keys(selectState(tokenPortfolio).chainRecordsWithTokens).length > 0 ? (
                    <Molecules.NativeTokenPortfolioTable
                      address={address}
                      tokenData={
                        selectState(tokenPortfolio).chainRecordsWithTokens['sonic'] || {
                          totalUsdValue: 0,
                          tokens: [],
                        }
                      }
                    />
                  ) : (
                    <Atoms.Empty
                      title="No tokens found"
                      subtitle="Send tokens to this address to manage your portfolio"
                    />
                  )}
                </div>
              </div>
            </Atoms.Loadable>
            <Molecules.InvestmentObjectiveModal
              open={openObjectiveModal}
              handleOpen={open => setOpenObjectiveModal(open)}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Dashboard;
