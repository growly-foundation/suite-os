import { createPublicClient, http, Address, PublicClient, slice } from 'viem';
import { mainnet, optimism, arbitrum, base, polygon } from 'viem/chains';
import { Token, CurrencyAmount, Percent, ChainId } from '@uniswap/sdk-core';

// Define supported chains with their corresponding RPC URLs
const CHAIN_CONFIG = {
  ethereum: {
    chain: mainnet,
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: ChainId.MAINNET,
  },
  optimism: {
    chain: optimism,
    rpcUrl: 'https://optimism.llamarpc.com',
    chainId: ChainId.OPTIMISM,
  },
  arbitrum: {
    chain: arbitrum,
    rpcUrl: 'https://arbitrum.llamarpc.com',
    chainId: ChainId.ARBITRUM_ONE,
  },
  base: {
    chain: base,
    rpcUrl: 'https://base.llamarpc.com',
    chainId: ChainId.BASE,
  },
  polygon: {
    chain: polygon,
    rpcUrl: 'https://polygon.llamarpc.com',
    chainId: ChainId.POLYGON,
  },
};

// Token information lookup by chain and symbol
const TOKEN_INFO: Record<
  string,
  Record<string, { address: string; decimals: number; name: string }>
> = {
  ethereum: {
    ETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      name: 'Wrapped Ether',
    }, // WETH
    USDC: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, name: 'USD Coin' },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'Tether USD',
    },
    DAI: {
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      name: 'Dai Stablecoin',
    },
  },
  optimism: {
    ETH: {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      name: 'Wrapped Ether',
    },
    USDC: { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6, name: 'USD Coin' },
    OP: { address: '0x4200000000000000000000000000000000000042', decimals: 18, name: 'Optimism' },
  },
  arbitrum: {
    ETH: {
      address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      decimals: 18,
      name: 'Wrapped Ether',
    },
    USDC: { address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', decimals: 6, name: 'USD Coin' },
    ARB: { address: '0x912CE59144191C1204E64559FE8253a0e49E6548', decimals: 18, name: 'Arbitrum' },
  },
  base: {
    ETH: {
      address: '0x4200000000000000000000000000000000000006',
      decimals: 18,
      name: 'Wrapped Ether',
    },
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, name: 'USD Coin' },
  },
  polygon: {
    MATIC: {
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      decimals: 18,
      name: 'Wrapped Matic',
    },
    USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6, name: 'USD Coin' },
  },
};

// Common fee values used for pools (in basis points)
const FEE_TIERS = [
  { amount: 100, name: '0.01%' }, // 1 basis point
  { amount: 500, name: '0.05%' }, // 5 basis points
  { amount: 3000, name: '0.3%' }, // 30 basis points
  { amount: 10000, name: '1%' }, // 100 basis points
];

// Uniswap V4 contract addresses
const UNISWAP_V4_CONTRACTS = {
  ethereum: {
    poolManager: '0xAeB3B597b15429CC6F96327f80AF3F149Ba667D0',
    positionManager: '0x1c0B01a7384f75B6256F98e7accb44456F1F0669',
  },
  optimism: {
    poolManager: '0xAeB3B597b15429CC6F96327f80AF3F149Ba667D0',
    positionManager: '0x1c0B01a7384f75B6256F98e7accb44456F1F0669',
  },
  arbitrum: {
    poolManager: '0xAeB3B597b15429CC6F96327f80AF3F149Ba667D0',
    positionManager: '0x1c0B01a7384f75B6256F98e7accb44456F1F0669',
  },
  base: {
    poolManager: '0xAeB3B597b15429CC6F96327f80AF3F149Ba667D0',
    positionManager: '0x1c0B01a7384f75B6256F98e7accb44456F1F0669',
  },
  polygon: {
    poolManager: '0xAeB3B597b15429CC6F96327f80AF3F149Ba667D0',
    positionManager: '0x1c0B01a7384f75B6256F98e7accb44456F1F0669',
  },
};

// Standard Uniswap V4 position manager ABI for fetching pool data
const POSITION_MANAGER_ABI = [
  {
    inputs: [{ name: 'poolId', type: 'bytes25' }],
    name: 'poolKeys',
    outputs: [
      { name: 'currency0', type: 'address' },
      { name: 'currency1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickSpacing', type: 'int24' },
      { name: 'hooks', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

// Pool Manager ABI
const POOL_MANAGER_ABI = [
  {
    inputs: [],
    name: 'slot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },
      { name: 'unlocked', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getLiquidity',
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getSlot0',
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getFee',
    outputs: [{ name: '', type: 'uint24' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export interface PoolData {
  name: string;
  tokenA: string;
  tokenB: string;
  fee: number;
  apr: number;
  tvl: number;
  volume24h: number;
  address: string;
  chain: string;
}

export class PoolDataFetcher {
  private clients: Record<string, PublicClient> = {};

  constructor() {
    // Initialize public clients for each supported chain
    Object.entries(CHAIN_CONFIG).forEach(([chainName, config]) => {
      this.clients[chainName] = createPublicClient({
        chain: config.chain,
        transport: http(config.rpcUrl),
      }) as PublicClient;
    });
  }

  /**
   * Create a Token instance from symbol for use with Uniswap SDK
   */
  private getToken(chainName: string, symbol: string): Token | null {
    const chainInfo = CHAIN_CONFIG[chainName];
    const tokenInfo = TOKEN_INFO[chainName]?.[symbol];

    if (!chainInfo || !tokenInfo) {
      return null;
    }

    return new Token(
      chainInfo.chainId,
      tokenInfo.address as Address,
      tokenInfo.decimals,
      symbol,
      tokenInfo.name
    );
  }

  /**
   * Get pool keys from position manager
   */
  private async getPoolKeys(
    client: PublicClient,
    chainName: string,
    poolId: string
  ): Promise<{
    currency0: Address;
    currency1: Address;
    fee: number;
    tickSpacing: number;
    hooks: Address;
  } | null> {
    try {
      // Get position manager contract address
      const positionManager = UNISWAP_V4_CONTRACTS[chainName]?.positionManager as Address;
      if (!positionManager) {
        throw new Error(`No position manager found for chain: ${chainName}`);
      }

      // Slice the poolId to get bytes25 (following the JavaScript example)
      const poolIdBytes25 = slice(poolId as `0x${string}`, 0, 25);

      // Call poolKeys function on position manager
      const result = await client.readContract({
        address: positionManager,
        abi: POSITION_MANAGER_ABI,
        functionName: 'poolKeys',
        args: [poolIdBytes25],
      });

      // Type assertion for the returned tuple
      if (!Array.isArray(result) || result.length !== 5) {
        throw new Error('Unexpected result format from poolKeys');
      }

      return {
        currency0: result[0] as Address,
        currency1: result[1] as Address,
        fee: Number(result[2]),
        tickSpacing: Number(result[3]),
        hooks: result[4] as Address,
      };
    } catch (error) {
      console.error('Error getting pool keys:', error);
      return null;
    }
  }

  /**
   * Find the best pool for a token pair on a specific chain using Uniswap V4
   */
  async findBestPoolForPair(
    chainName: string,
    tokenASymbol: string,
    tokenBSymbol: string
  ): Promise<PoolData | null> {
    try {
      // Get client for the specified chain
      const client = this.clients[chainName];
      if (!client) {
        throw new Error(`Unsupported chain: ${chainName}`);
      }

      // Create Token instances using Uniswap SDK
      const tokenA = this.getToken(chainName, tokenASymbol);
      const tokenB = this.getToken(chainName, tokenBSymbol);

      if (!tokenA || !tokenB) {
        console.error(
          `Could not create tokens for ${tokenASymbol} or ${tokenBSymbol} on ${chainName}`
        );
        return null;
      }

      // Ensure tokenA and tokenB are in the correct order (lower address first)
      const [token0, token1] =
        tokenA.address.toLowerCase() < tokenB.address.toLowerCase()
          ? [tokenA, tokenB]
          : [tokenB, tokenA];

      // In a real implementation, we would query a subgraph to find active pools
      // For now, we'll simulate finding a pool by generating a poolId based on token addresses
      // This is a simplified approach - in production, you'd query the actual pools

      // Get pool manager address
      const poolManager = UNISWAP_V4_CONTRACTS[chainName]?.poolManager as Address;
      if (!poolManager) {
        throw new Error(`No pool manager found for chain: ${chainName}`);
      }

      // Try different fee tiers
      let bestPool: { id: string; fee: number } | null = null;
      let bestLiquidity = BigInt(0);

      for (const feeTier of FEE_TIERS) {
        try {
          // In V4, pools are identified by IDs, not addresses
          // This is a mock poolId - in production, you would get real poolIds from events or subgraphs
          const mockPoolId = `0x${token0.address.slice(2)}${token1.address.slice(2)}${feeTier.amount.toString(16).padStart(6, '0')}`;

          // Try to get liquidity for this pool
          try {
            const liquidity = await client.readContract({
              address: poolManager,
              abi: POOL_MANAGER_ABI,
              functionName: 'getLiquidity',
              args: [mockPoolId as `0x${string}`],
            });

            if (liquidity && BigInt(liquidity.toString()) > BigInt(0)) {
              // If this pool has more liquidity than any we've seen, choose it
              if (!bestPool || BigInt(liquidity.toString()) > bestLiquidity) {
                bestPool = { id: mockPoolId, fee: feeTier.amount };
                bestLiquidity = BigInt(liquidity.toString());
              }
            }
          } catch (error) {
            // Pool doesn't exist or other error - continue to next fee tier
            continue;
          }
        } catch (error) {
          // Continue to next fee tier
          continue;
        }
      }

      if (!bestPool) {
        console.log(`No active pool found for ${tokenASymbol}/${tokenBSymbol} on ${chainName}`);
        return null;
      }

      // Fetch detailed data for the best pool
      return await this.fetchPoolData(
        chainName,
        bestPool.id,
        `${tokenASymbol}/${tokenBSymbol}`,
        bestPool.fee
      );
    } catch (error) {
      console.error('Error finding pool for pair:', error);
      return null;
    }
  }

  /**
   * Fetch detailed data for a specific pool
   */
  async fetchPoolData(
    chainName: string,
    poolId: string,
    poolName: string,
    fee: number
  ): Promise<PoolData> {
    try {
      const client = this.clients[chainName];
      if (!client) {
        throw new Error(`Unsupported chain: ${chainName}`);
      }

      // Get pool manager address
      const poolManager = UNISWAP_V4_CONTRACTS[chainName]?.poolManager as Address;
      if (!poolManager) {
        throw new Error(`No pool manager found for chain: ${chainName}`);
      }

      // Fetch pool data using V4 pool manager
      let liquidity: bigint;
      let sqrtPriceX96: bigint;

      try {
        // Get liquidity
        const liquidityResult = await client.readContract({
          address: poolManager,
          abi: POOL_MANAGER_ABI,
          functionName: 'getLiquidity',
          args: [poolId as `0x${string}`],
        });

        // Ensure we have a valid bigint
        if (typeof liquidityResult === 'bigint') {
          liquidity = liquidityResult;
        } else if (liquidityResult !== null && liquidityResult !== undefined) {
          // Try to convert to bigint if it's another type
          liquidity = BigInt(String(liquidityResult));
        } else {
          throw new Error('Invalid liquidity result');
        }

        // Get current price
        const slot0Result = await client.readContract({
          address: poolManager,
          abi: POOL_MANAGER_ABI,
          functionName: 'getSlot0',
          args: [poolId as `0x${string}`],
        });

        // Ensure we have a valid slot0 result
        if (Array.isArray(slot0Result) && slot0Result.length > 0) {
          const priceValue = slot0Result[0];
          if (typeof priceValue === 'bigint') {
            sqrtPriceX96 = priceValue;
          } else {
            sqrtPriceX96 = BigInt(String(priceValue));
          }
        } else {
          throw new Error('Invalid slot0 result');
        }
      } catch (error) {
        console.error('Error fetching pool data, using fallback values:', error);
        // Use fallback values for demo
        liquidity = BigInt(1000000000000000n);
        sqrtPriceX96 = BigInt(1000000000000000000n);
      }

      // Parse the pool name to get token symbols
      const [tokenA, tokenB] = poolName.split('/');

      // In a real implementation, we would query a price API or use on-chain oracles
      // to get token prices and calculate TVL and APR accurately

      // For demonstration, we'll compute some reasonable estimates
      // Assume an average price based on common token values (simplified)
      const estimatedPriceA =
        tokenA === 'ETH'
          ? 3000
          : tokenA === 'USDC' || tokenA === 'USDT' || tokenA === 'DAI'
            ? 1
            : tokenA === 'OP' || tokenA === 'ARB'
              ? 2
              : tokenA === 'MATIC'
                ? 0.5
                : 10;

      const estimatedPriceB =
        tokenB === 'ETH'
          ? 3000
          : tokenB === 'USDC' || tokenB === 'USDT' || tokenB === 'DAI'
            ? 1
            : tokenB === 'OP' || tokenB === 'ARB'
              ? 2
              : tokenB === 'MATIC'
                ? 0.5
                : 10;

      // Calculate TVL based on liquidity and estimated prices
      const liquidityNumber = Number(liquidity);
      const tvl = (liquidityNumber * (estimatedPriceA + estimatedPriceB)) / 1e9;

      // Estimate 24h volume (in production, this would come from subgraph data)
      const volume24h = tvl * 0.2; // Assume 20% of TVL is traded daily

      // Calculate APR based on fee tier and estimated volume
      // Formula: (24h volume * fee tier * 365) / TVL
      const aprPercentage = ((volume24h * (fee / 1000000) * 365) / tvl) * 100;

      return {
        name: poolName,
        tokenA,
        tokenB,
        fee: fee / 10000, // Convert to basis points for display
        apr: parseFloat(aprPercentage.toFixed(2)),
        tvl: parseFloat(tvl.toFixed(2)),
        volume24h: parseFloat(volume24h.toFixed(2)),
        address: 'v4-' + poolId, // V4 pools don't have their own address, using poolId
        chain: chainName,
      };
    } catch (error) {
      console.error('Error fetching pool data:', error);

      // Return a fallback with estimates if we encounter errors
      return {
        name: poolName,
        tokenA: poolName.split('/')[0],
        tokenB: poolName.split('/')[1],
        fee: fee / 10000,
        apr: 15.0, // Fallback APR estimate
        tvl: 1000000, // Fallback TVL estimate $1M
        volume24h: 200000, // Fallback volume estimate $200K
        address: 'v4-fallback',
        chain: chainName,
      };
    }
  }
}
