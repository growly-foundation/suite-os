import { TAddress, TChainName } from '@getgrowly/chainsmith/types';
import { formatDuration } from '@getgrowly/chainsmith/utils';

import { EvmChainService, OnchainBusterService } from '../src/services';

/**
 * Example usage of the enhanced OnchainBusterService with persona classification
 */
export async function walletActivityStats(): Promise<void> {
  // Initialize services
  const evmChainService = new EvmChainService();
  const onchainBuster = new OnchainBusterService(evmChainService);

  const walletAddress: TAddress = '0x6c34c667632dc1aaf04f362516e6f44d006a58fa';
  const chainNames: TChainName[] = ['mainnet', 'base', 'optimism'];

  try {
    console.log(`🔍 Comprehensive Analysis for: ${walletAddress}`);
    console.log(`🌐 Chains: ${chainNames.join(', ')}`);
    console.log('⏳ Fetching all data...\n');

    // Get comprehensive analysis including persona classification
    const analysis = await onchainBuster.fetchActivityStats(walletAddress, chainNames);

    // Display basic wallet info
    console.log('📊 WALLET OVERVIEW');
    console.log('='.repeat(50));
    console.log(`📅 Creation Date: ${analysis.walletCreationDate.toDateString()}`);
    console.log(`⛽ Total Gas Spent: ${analysis.totalGasInETH.toFixed(4)} ETH`);
    console.log(
      `🔄 Total Transactions: ${analysis.activityStats ? Object.values(analysis.activityStats).reduce((sum, stat) => sum + stat.totalTxs, 0) : 0}`
    );

    // Display chain statistics
    console.log('\n🌐 CHAIN STATISTICS');
    console.log('='.repeat(50));
    console.log(`🔥 Most Active Chain: ${analysis.chainStats.mostActiveChainName}`);
    console.log(`📊 Active Chains: ${analysis.chainStats.totalChains.length}`);
    console.log(`💤 Inactive Chains: ${analysis.chainStats.noActivityChains.length}`);
    console.log(`📅 Unique Active Days: ${analysis.chainStats.countUniqueDaysActiveChain}`);

    // Display longest holding tokens by chain
    console.log('\n⏰ LONGEST HOLDINGS BY CHAIN');
    console.log('='.repeat(50));
    analysis.longestHoldingTokenByChain.forEach(holding => {
      console.log(`${holding.chain}: ${holding.symbol} (${formatDuration(holding.duration)})`);
    });

    // Display activity stats by chain
    console.log('\n📈 ACTIVITY BY CHAIN');
    console.log('='.repeat(50));
    Object.entries(analysis.activityStats || {}).forEach(([chain, stats]) => {
      console.log(`${chain.toUpperCase()}:`);
      console.log(`  📊 Total Txs: ${stats.totalTxs}`);
      console.log(`  📅 Active Days: ${stats.uniqueActiveDays}`);
      console.log(`  🔥 Longest Streak: ${stats.longestStreakDays} days`);
      console.log(`  ⏱️ Activity Period: ${stats.activityPeriod} days`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error during comprehensive analysis:', error);
  }
}

/**
 * Quick persona analysis only
 */
export async function personaAnalysisExample(): Promise<void> {
  const evmChainService = new EvmChainService();
  const onchainBuster = new OnchainBusterService(evmChainService);

  const walletAddress: TAddress = '0x55Fce96D44c96Ef27f296aEB37aD0eb360505015';
  const chainNames: TChainName[] = ['mainnet', 'base', 'optimism'];

  try {
    console.log(`🎭 Quick Persona Analysis for: ${walletAddress}\n`);

    const personaAnalysis = await onchainBuster.fetchPersonaAnalysis(walletAddress, chainNames);

    console.log(`🏆 Your DeFi Persona: ${personaAnalysis.analysis.dominantTrait}`);
    console.log(
      `💰 Portfolio Value: $${personaAnalysis.analysis.walletMetrics.totalPortfolioValue.toLocaleString()}`
    );
    console.log(
      `💰 Token Portfolio Value: $${personaAnalysis.analysis.walletMetrics.tokenPortfolioValue.toLocaleString()}`
    );
    console.log(
      `💰 NFT Portfolio Value: $${personaAnalysis.analysis.walletMetrics.nftPortfolioValue.toLocaleString()}`
    );
    console.log(
      `💰 ETH Holding: ${personaAnalysis.analysis.walletMetrics.ethHolding.toLocaleString()}`
    );

    // Show top 3 satisfied metrics for the dominant trait
    const dominantTraitScore = personaAnalysis.analysis.traitScores.find(
      t => t.trait === personaAnalysis.analysis.dominantTrait
    );

    if (dominantTraitScore) {
      console.log('\n✅ Key Characteristics:');
      dominantTraitScore.metrics
        .filter(m => m.satisfied)
        .slice(0, 3)
        .forEach(metric => {
          const weightEmoji = metric.weight === 3 ? '🔥' : metric.weight === 2 ? '⚡' : '💫';
          console.log(`${weightEmoji} ${metric.name}`);
        });
    }
  } catch (error) {
    console.error('❌ Error during persona analysis:', error);
  }
}

personaAnalysisExample();
