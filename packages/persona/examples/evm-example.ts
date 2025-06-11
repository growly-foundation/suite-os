import { TAddress, TChainName } from '@getgrowly/chainsmith/types';

import { EvmChainService } from '../src/services/evm';

const EXAMPLE_WALLET = '0x6c34C667632dC1aAF04F362516e6F44D006A58fa' as TAddress;

// Supported chains to test
const CHAINS: TChainName[] = ['mainnet', 'base', 'optimism'];

async function demonstrateEvmChainService() {
  const evmService = new EvmChainService();

  console.log('🚀 Testing EvmChainService Capabilities');
  console.log('='.repeat(60));
  console.log(`📍 Wallet Address: ${EXAMPLE_WALLET}`);
  console.log(`🔗 Chains: ${CHAINS.join(', ')}`);
  console.log('\n');

  try {
    // Test 1: Token Transfer Activities
    console.log('📊 1. Fetching Token Transfer Activities...');
    console.log('-'.repeat(40));

    const tokenActivities = await evmService.listMultichainTokenTransferActivities(
      EXAMPLE_WALLET,
      CHAINS
    );

    console.log('Token Activities Summary:');
    for (const [chain, activities] of Object.entries(tokenActivities)) {
      console.log(`  ${chain}: ${activities?.length || 0} transactions`);

      // Show first few transactions as examples
      if (activities && activities.length > 0) {
        console.log(`    Latest transaction: ${activities[0].blockHash}`);
        console.log(`    Token Symbol: ${activities[0].symbol || 'N/A'}`);
        console.log(`    Value: ${activities[0].value || 'N/A'}`);
      }
    }
    console.log('\n');

    // Test 2: NFT Transfer Activities
    console.log('🖼️  2. Fetching NFT Transfer Activities...');
    console.log('-'.repeat(40));

    const nftActivities = await evmService.listMultichainNftTransferActivities(
      EXAMPLE_WALLET,
      CHAINS
    );

    console.log('NFT Activities Summary:');
    for (const [chain, activities] of Object.entries(nftActivities)) {
      console.log(`  ${chain}: ${activities?.length || 0} NFT transactions`);

      // Show first few NFT transactions as examples
      if (activities && activities.length > 0) {
        console.log(`    Latest NFT transaction: ${activities[0].hash}`);
        console.log(`    Token Name: ${activities[0].tokenName || 'N/A'}`);
        console.log(`    Token ID: ${activities[0].tokenID || 'N/A'}`);
      }
    }
    console.log('\n');

    // Test 3: Token Portfolio
    console.log('💰 3. Fetching Token Portfolio...');
    console.log('-'.repeat(40));

    const tokenPortfolio = await evmService.getWalletTokenPortfolio(EXAMPLE_WALLET, CHAINS);

    console.log('Token Portfolio Summary:');
    console.log(
      `  Total Portfolio Value: $${tokenPortfolio.totalUsdValue?.toLocaleString() || 'N/A'}`
    );

    // Get total tokens across all chains
    const allTokens = Object.values(tokenPortfolio.chainRecordsWithTokens || {}).flatMap(
      tokenList => tokenList.tokens || []
    );
    console.log(`  Number of Tokens: ${allTokens.length}`);

    // Show top tokens by value
    if (allTokens.length > 0) {
      const sortedTokens = allTokens
        .filter(token => token.usdValue && token.usdValue > 0)
        .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0))
        .slice(0, 5);

      console.log('  Top 5 Tokens by Value:');
      sortedTokens.forEach((token, index) => {
        console.log(
          `    ${index + 1}. ${token.symbol || 'Unknown'}: $${token.usdValue?.toLocaleString() || 'N/A'}`
        );
      });
    }
    console.log('\n');

    // Test 4: NFT Portfolio
    console.log('🎨 4. Fetching NFT Portfolio...');
    console.log('-'.repeat(40));

    const nftPortfolio = await evmService.getWalletNftPortfolio(EXAMPLE_WALLET, CHAINS);

    console.log('NFT Portfolio Summary:');
    console.log(`  Total NFT Value: $${nftPortfolio.totalUsdValue?.toLocaleString() || 'N/A'}`);

    // Get total NFTs across all chains
    const allNfts = Object.values(nftPortfolio.chainRecordsWithNfts || {}).flatMap(
      nftList => nftList.nfts || []
    );
    console.log(`  Number of NFTs: ${allNfts.length}`);

    // Show top NFTs by value
    if (allNfts.length > 0) {
      const sortedNfts = allNfts
        .filter(nft => nft.usdValue && nft.usdValue > 0)
        .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0))
        .slice(0, 5);

      console.log('  Top 5 NFTs by Value:');
      sortedNfts.forEach((nft, index) => {
        console.log(
          `    ${index + 1}. ${nft.name || 'Unknown'}: $${nft.usdValue?.toLocaleString() || 'N/A'}`
        );
      });
    }
    console.log('\n');

    // Test 5: Chain-by-Chain Analysis
    console.log('🔍 5. Chain-by-Chain Analysis...');
    console.log('-'.repeat(40));

    for (const chain of CHAINS) {
      console.log(`\n📍 ${chain.toUpperCase()} Analysis:`);

      const chainTokenActivities = tokenActivities[chain] || [];
      const chainNftActivities = nftActivities[chain] || [];
      const chainTokens = tokenPortfolio.chainRecordsWithTokens?.[chain]?.tokens || [];
      const chainNfts = nftPortfolio.chainRecordsWithNfts?.[chain]?.nfts || [];

      console.log(`  Token Transactions: ${chainTokenActivities.length}`);
      console.log(`  NFT Transactions: ${chainNftActivities.length}`);
      console.log(`  Current Tokens: ${chainTokens.length}`);
      console.log(`  Current NFTs: ${chainNfts.length}`);

      const chainTokenValue = chainTokens.reduce((sum, token) => sum + (token.usdValue || 0), 0);
      const chainNftValue = chainNfts.reduce((sum, nft) => sum + (nft.usdValue || 0), 0);

      console.log(`  Token Portfolio Value: $${chainTokenValue.toLocaleString()}`);
      console.log(`  NFT Portfolio Value: $${chainNftValue.toLocaleString()}`);
      console.log(`  Total Chain Value: $${(chainTokenValue + chainNftValue).toLocaleString()}`);
    }

    console.log('\n');
    console.log('✅ EvmChainService testing completed successfully!');
  } catch (error) {
    console.error('❌ Error testing EvmChainService:', error);
    throw error;
  }
}

demonstrateEvmChainService();
