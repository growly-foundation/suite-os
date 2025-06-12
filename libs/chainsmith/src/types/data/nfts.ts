import type { TAddress, TChainId } from '../network/chains';
import type { TTokenSymbol } from './tokens';

// Single NFT
export type TNftMetadata = {
  chainId: TChainId;
  address: string;
  tokenID: string;
  name: string;
  interface: string; // "ERC721 | ERC1155"
  imageUrl: string;
  previewUrl: string;
};

export type TMarketNft = TNftMetadata & {
  usdValue: number;
};

export type TNftBalance = TNftMetadata & {
  balance: number;
};

// Collection
export interface TNftCollectionMetadata {
  chainId: TChainId;
  address: string;
  name: string;
  description: string;
  imageUrl: string;
  bannerUrl: string;
  floorPrice: number;
  currency: string;
}

export type TMarketNftCollection = TNftCollectionMetadata & {
  usdValue: number;
};

export type TNftCollectionBalance = TNftCollectionMetadata & {
  balance: number;
};

// Transfer Activity
export interface TNftTransferActivity {
  chainId: TChainId;

  blockHash: string;
  from: TAddress;
  to: TAddress;
  timestamp: string;
  hash: string;

  tokenID: string;
  tokenName: string;
  tokenSymbol: TTokenSymbol;
}
