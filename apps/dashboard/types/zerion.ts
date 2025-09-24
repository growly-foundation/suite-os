// Zerion API Response Types
export interface ZerionBalanceChartResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionBalanceChart;
}

export interface ZerionPortfolioResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionPortfolio;
}

export interface ZerionFungiblePositionsResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionFungiblePosition[];
}

export interface ZerionTransactionsResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionTransaction[];
}

export interface ZerionNftPositionsResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionNftPosition[];
}

export interface ZerionNftCollectionsResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionNftCollection[];
}

export interface ZerionNftPortfolioResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionNftPortfolio;
}

export interface ZerionPnLResponse {
  links: {
    self: string;
    next?: string;
  };
  data: ZerionPnL;
}

// Core Data Types
export interface ZerionBalanceChart {
  type: string;
  id: string;
  attributes: {
    points: Array<{
      timestamp: number;
      value: number;
    }>;
    currency: string;
    period: string;
  };
}

export interface ZerionPortfolio {
  type: string;
  id: string;
  attributes: {
    positions_distribution_by_type: {
      wallet: number;
      deposited: number;
      borrowed: number;
      locked: number;
      staked: number;
    };
    positions_distribution_by_chain: {
      [key: string]: number;
    };
    total: {
      positions: number;
    };
    changes: {
      absolute_1d: number;
      percent_1d: number;
    };
  };
}

export interface ZerionFungiblePosition {
  type: string;
  id: string;
  attributes: {
    parent: string | null;
    protocol: string | null;
    pool_address?: string;
    group_id?: string;
    name: string;
    position_type: 'deposit' | 'reward' | 'staked' | 'wallet';
    quantity: {
      int: string;
      decimals: number;
      float: number;
      numeric: string;
    };
    value: number | null;
    price: number;
    changes: {
      absolute_1d: number;
      percent_1d: number;
    } | null;
    fungible_info: {
      name: string;
      symbol: string;
      icon: {
        url: string;
      } | null;
      flags: {
        verified: boolean;
      };
      implementations: Array<{
        chain_id: string;
        address: string | null;
        decimals: number;
      }>;
    };
    flags: {
      displayable: boolean;
      is_trash: boolean;
    };
    updated_at: string;
    updated_at_block: number | null;
    application_metadata?: {
      name: string;
      icon: {
        url: string;
      };
      url: string;
    };
  };
  relationships: {
    chain: {
      links: {
        related: string;
      };
      data: {
        type: string;
        id: string;
      };
    };
    dapp?: {
      data: {
        type: string;
        id: string;
      };
    };
    fungible: {
      links: {
        related: string;
      };
      data: {
        type: string;
        id: string;
      };
    };
  };
}

export interface ZerionTransaction {
  type: string;
  id: string;
  attributes: {
    operation_type: string;
    hash: string;
    mined_at: string;
    sent_at: string;
    nonce: number;
    fee: {
      value: number;
      price: number;
    };
    status: 'confirmed' | 'failed' | 'pending';
    safe: boolean;
    transfers: Array<{
      from: string;
      to: string;
      fungible_info: {
        name: string;
        symbol: string;
        icon: {
          url: string;
        } | null;
        flags: {
          verified: boolean;
        };
        implementations: Array<{
          chain_id: string;
          address: string | null;
          decimals: number;
        }>;
      };
      quantity: {
        int: string;
        decimals: number;
        float: number;
        numeric: string;
      };
      value: number | null;
      price: number;
    }>;
    nft_transfers?: Array<{
      from: string;
      to: string;
      nft_info: {
        contract_address: string;
        token_id: string;
        name: string;
        interface: string;
        content: {
          preview: {
            url: string;
          };
          detail: {
            url: string;
          };
        };
        flags: {
          is_spam: boolean;
        };
      };
      quantity: {
        int: string;
        decimals: number;
        float: number;
        numeric: string;
      };
    }>;
    protocol?: {
      name: string;
      icon: {
        url: string;
      };
      url: string;
    };
    dapp?: {
      name: string;
      icon: {
        url: string;
      };
      url: string;
    };
  };
  relationships: {
    chain: {
      links: {
        related: string;
      };
      data: {
        type: string;
        id: string;
      };
    };
  };
}

export interface ZerionNftPosition {
  type: string;
  id: string;
  attributes: {
    changed_at: string;
    amount: string;
    price: number;
    value: number;
    nft_info: {
      contract_address: string;
      token_id: string;
      name: string;
      interface: string;
      content: {
        preview: {
          url: string;
        };
        detail: {
          url: string;
        };
      };
      flags: {
        is_spam: boolean;
      };
    };
    collection_info: {
      name: string;
      description: string;
      content?: {
        icon: {
          url: string;
        };
        banner?: {
          url: string;
        };
      };
    };
  };
  relationships: {
    chain: {
      links: {
        related: string;
      };
      data: {
        type: string;
        id: string;
      };
    };
    nft: {
      data: {
        type: string;
        id: string;
      };
    };
    nft_collection: {
      data: {
        type: string;
        id: string;
      };
    };
    wallet_nft_collection: {
      data: {
        type: string;
        id: string;
      };
    };
  };
}

export interface ZerionNftCollection {
  type: string;
  id: string;
  attributes: {
    min_changed_at: string;
    max_changed_at: string;
    nfts_count: string;
    total_floor_price: number;
    collection_info: {
      name: string;
      description: string;
      content?: {
        icon: {
          url: string;
        };
        banner?: {
          url: string;
        };
      };
    };
  };
  relationships: {
    chains: {
      data: Array<{
        type: string;
        id: string;
      }>;
    };
    nft_collection: {
      data: {
        type: string;
        id: string;
      };
    };
  };
}

export interface ZerionNftPortfolio {
  type: string;
  id: string;
  attributes: {
    positions_distribution_by_chain: Record<string, number>;
  };
}

export interface ZerionPnL {
  type: string;
  id: string;
  attributes: {
    realized_gain: number;
    unrealized_gain: number;
    total_fee: number;
    net_invested: number;
    received_external: number;
    sent_external: number;
    sent_for_nfts: number;
    received_for_nfts: number;
  };
}

// Parameter Types
export interface ZerionWalletParams {
  currency?: string;
  'filter[chain_ids]'?: string;
  period?: string;
  'filter[positions]'?: string;
  'filter[trash]'?: string;
  sort?: string;
}

export interface ZerionTransactionParams {
  currency?: string;
  'filter[chain_ids]'?: string;
  'filter[operation_types]'?: string;
  'filter[fungible_ids]'?: string;
  'filter[fungible_implementations]'?: string;
  'filter[min_mined_at]'?: number; // Timestamp in milliseconds
  'filter[max_mined_at]'?: number; // Timestamp in milliseconds
  sort?: string;
  page?: number;
  'page[size]'?: number;
}

export interface ZerionPositionParams {
  currency?: string;
  'filter[chain_ids]'?: string;
  'filter[positions]'?: string;
  'filter[trash]'?: string;
  'filter[protocol]'?: string;
  'filter[dapp]'?: string;
  'filter[fungible]'?: string;
  sort?: string;
  page?: number;
  'page[size]'?: number;
}

export interface ZerionNftParams {
  currency?: string;
  'filter[chain_ids]'?: string;
  'filter[collection_ids]'?: string;
  sort?: string;
  page?: number;
  'page[size]'?: number;
}

export interface ZerionPortfolioParams {
  currency?: string;
  'filter[chain_ids]'?: string;
  'filter[positions]'?: string;
  'filter[trash]'?: string;
}

export interface ZerionPnLParams {
  currency?: string;
  'filter[chain_ids]'?: string;
  'filter[fungible]'?: string;
  'filter[from_date]'?: string;
  'filter[to_date]'?: string;
}

// Utility Types
export type ZerionChainId =
  | 'ethereum'
  | 'arbitrum'
  | 'optimism'
  | 'polygon'
  | 'base'
  | 'avalanche'
  | 'bsc'
  | 'fantom'
  | 'celo'
  | 'gnosis'
  | 'aurora'
  | 'linea'
  | 'scroll'
  | 'zksync'
  | 'blast'
  | 'solana'
  | 'berachain'
  | 'blast'
  | 'zora'
  | 'mode'
  | 'taiko'
  | 'mantle'
  | 'metis'
  | 'opbnb'
  | 'unichain'
  | 'story'
  | 'abstract'
  | 'degen'
  | 'world'
  | 'lens'
  | 'katana'
  | 'soneium'
  | 'hyperliquid'
  | 'gravity'
  | 'apechain'
  | 'ink'
  | 'monad'
  | 'zero'
  | 'unichain-sepolia'
  | 'zero-sepolia'
  | 'ethereum-sepolia';

export type ZerionOperationType =
  | 'approve'
  | 'borrow'
  | 'burn'
  | 'cancel'
  | 'claim'
  | 'deploy'
  | 'deposit'
  | 'execute'
  | 'mint'
  | 'receive'
  | 'repay'
  | 'send'
  | 'stake'
  | 'trade'
  | 'unstake'
  | 'withdraw';

export type ZerionTransactionStatus = 'confirmed' | 'failed' | 'pending';

export type ZerionPositionType = 'deposit' | 'reward' | 'staked' | 'wallet';

export type ZerionSortOrder = 'asc' | 'desc';

export type ZerionPeriod = '1d' | '7d' | '30d' | '90d' | '1y' | 'all';
