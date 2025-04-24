import { formatNumberUSD } from '@/core';
import { Avatar, Table } from '@radix-ui/themes';
import { TAddress, TMarketTokenList } from 'chainsmith-sdk/types';
import React from 'react';
import ChainIcon from '../ChainIcon/ChainIcon';
import TokenRisktBadge from '../TokenRiskBadge/TokenRisktBadge';
import { getChainByName, getChainIdByName } from 'chainsmith-sdk/utils';
import Countup from 'react-countup';
import { ArrowRightLeftIcon, ScanSearchIcon } from 'lucide-react';
import SwapButton from '../SwapButton/SwapButton';
import AnalyzeTokenButton from '../AnalyzeTokenButton/AnlyzeTokenButton';
import { ChainType } from '@lifi/widget';

type Props = {
  address: TAddress;
  tokenData: TMarketTokenList;
};

const NativeTokenPortfolioTable = ({ address, tokenData }: Props) => {
  return (
    <React.Fragment>
      <div className="mb-10">
        <div className="flex gap-2 justify-center items-center w-fit rounded-xl py-1 px-3 shadow-xl">
          <ChainIcon size={20} chainName={'sonic'} />
          <h3 className="font-bold">{getChainByName('sonic').name}</h3>
          <h3 className="text-sm ml-4">
            <Countup end={tokenData.totalUsdValue} duration={4} formattingFn={formatNumberUSD} />
          </h3>
        </div>
        <Table.Root className="rounded-xl mt-3">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Token</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Risk</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>USD Value</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Market Price</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total Balance</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Percentage</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tokenData.tokens
              .sort((tokenA, tokenB) => (tokenA.usdValue > tokenB.usdValue ? -1 : 1))
              .map(token => (
                <Table.Row key={token.symbol}>
                  <Table.Cell>
                    <Avatar
                      src={`${token.logoURI}?raw=true`}
                      alt={`${token.name.slice(1)}`}
                      fallback={token.name.slice(0, 1)}
                      className="mr-3 inline-block h-8 w-8 rounded-full"
                    />
                    {token.name}
                  </Table.Cell>
                  <Table.Cell>
                    <TokenRisktBadge risk={token.marketRank || 0} />
                  </Table.Cell>
                  <Table.Cell>
                    <Countup end={token.usdValue} duration={4} formattingFn={formatNumberUSD} />
                  </Table.Cell>
                  <Table.Cell>{formatNumberUSD(token.marketPrice)}</Table.Cell>
                  <Table.Cell>{token.balance.toFixed(Math.min(token.decimals, 5))}</Table.Cell>
                  <Table.ColumnHeaderCell>
                    <div className="text-teal-500">
                      {((token.usdValue / tokenData.totalUsdValue) * 100).toFixed(2)} %
                    </div>
                  </Table.ColumnHeaderCell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <SwapButton
                        type="SWAP"
                        token={token}
                        tooltipContent="Rebalance Token"
                        supportedChains={[getChainIdByName('sonic')]}>
                        <ArrowRightLeftIcon size={10} />
                      </SwapButton>
                      <AnalyzeTokenButton
                        token={token}
                        tooltipContent="Analyze Token"
                        // TODO: Fix hardcode
                        reviewFrequency={'DAILY'}
                        riskLevel={'AGGRESSIVE'}
                        investmentObjective={'GROWTH'}
                        walletAddress={address}>
                        <ScanSearchIcon size={10} />
                      </AnalyzeTokenButton>
                      <SwapButton
                        type="TRANSFER"
                        token={token}
                        toAddress={{
                          address: address || '',
                          chainType: ChainType.EVM,
                        }}
                        buttonProps={{
                          className: 'bg-purple-100',
                        }}
                        tooltipContent="Deposit to Agent"
                        supportedChains={[getChainIdByName('sonic')]}>
                        🤖
                      </SwapButton>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      </div>
    </React.Fragment>
  );
};

export default NativeTokenPortfolioTable;
