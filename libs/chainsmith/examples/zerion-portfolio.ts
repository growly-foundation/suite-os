import 'reflect-metadata';

import { Wallets } from '../src/data';
import { ZerionPortfolioPlugin } from '../src/plugins/zerion';
import type { TMarketNftList, TNftPortfolio, TTokenPortfolio } from '../src/types';
import { buildDefaultChains } from './config';

// Zerion configuration
export const ZERION_API_BASE_URL = 'https://api.zerion.io/v1';
export const ZERION_API_KEY = process.env.ZERION_API_KEY || '';

// Initialize Zerion plugin
const zerionPlugin = new ZerionPortfolioPlugin(ZERION_API_BASE_URL, ZERION_API_KEY);

/**
 * Test function to fetch multichain token portfolio using Zerion
 */
async function testFetchZerionTokenPortfolio(): Promise<TTokenPortfolio> {
  const chains = buildDefaultChains(['mainnet', 'optimism', 'base']);
  const wallet = Wallets.ETH_MAINNET_WALLET_PCMINH;

  console.log(`🔄 Fetching Zerion token portfolio for wallet: ${wallet}`);
  console.log(`📊 Testing chains: ${chains.map(c => c.name).join(', ')}`);

  const portfolio = await zerionPlugin.getMultichainTokenPortfolio(wallet, chains);
  console.log(`✅ Token Portfolio Summary:`);
  console.log(`   💰 Total USD Value: $${portfolio.totalUsdValue.toFixed(2)}`);
  console.log(`   🔗 Chains with tokens: ${Object.keys(portfolio.chainRecordsWithTokens).length}`);
  console.log(
    `   💰 Most Valuable Token: ${portfolio.mostValuableToken.marketData.symbol} with $${portfolio.mostValuableToken.totalUsdValue.toFixed(2)}`
  );

  // Log details for each chain
  Object.entries(portfolio.chainRecordsWithTokens).forEach(([chainId, tokenList]) => {
    console.log(`   📊 Chain ${chainId}:`);
    console.log(`      💵 Total Value: $${tokenList.totalUsdValue.toFixed(2)}`);
    console.log(`      🪙 Token Count: ${tokenList.tokens.length}`);

    // Show top 3 tokens by value
    const topTokens = tokenList.tokens.sort((a, b) => b.usdValue - a.usdValue).slice(0, 3);

    topTokens.forEach((token, index) => {
      console.log(
        `         ${index + 1}. ${token.symbol}: $${token.usdValue.toFixed(2)} (Amount: ${token.balance.toFixed(4)})`
      );
    });
  });

  return portfolio;
}

/**
 * Test function to fetch multichain NFT portfolio using Zerion
 */
async function testFetchZerionNftPortfolio(): Promise<TNftPortfolio> {
  const chains = buildDefaultChains(['mainnet', 'optimism', 'base']);
  const wallet = Wallets.ETH_MAINNET_WALLET_PCMINH;

  console.log(`🔄 Fetching Zerion NFT portfolio for wallet: ${wallet}`);
  console.log(`🖼️  Testing chains: ${chains.map(c => c.name).join(', ')}`);

  const nftPortfolio = await zerionPlugin.getMultichainNftPortfolio(wallet, chains);

  console.log(`✅ NFT Portfolio Summary:`);
  console.log(`   💰 Total USD Value: $${nftPortfolio.totalUsdValue.toFixed(2)}`);
  console.log(`   🔗 Chains with NFTs: ${Object.keys(nftPortfolio.chainRecordsWithNfts).length}`);

  if (nftPortfolio.mostValuableNFT) {
    console.log(`   👑 Most Valuable NFT: ${nftPortfolio.mostValuableNFT.name}`);
    console.log(`      💵 Value: $${nftPortfolio.mostValuableNFT.usdValue.toFixed(2)}`);
  }

  // Log details for each chain
  Object.entries(nftPortfolio.chainRecordsWithNfts).forEach(([chainId, nftList]) => {
    const typedNftList = nftList as TMarketNftList;
    console.log(`   🖼️  Chain ${chainId}:`);
    console.log(`      💵 Total Value: $${typedNftList.totalUsdValue.toFixed(2)}`);
    console.log(`      🎨 NFT Count: ${typedNftList.nfts.length}`);

    // Show top 3 collections by value
    const topCollections = typedNftList.nfts.sort((a, b) => b.usdValue - a.usdValue).slice(0, 3);

    topCollections.forEach((nft, index) => {
      console.log(`         ${index + 1}. ${nft.name}: $${nft.usdValue.toFixed(2)}`);
    });
  });

  return nftPortfolio;
}

export { testFetchZerionNftPortfolio, testFetchZerionTokenPortfolio };
