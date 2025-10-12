import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Alchemy, Network } from 'alchemy-sdk';

export interface TokenBalance {
  tokenId: string;
  balance: number;
}

export interface ContractOwner {
  ownerAddress: string;
  tokenBalances?: TokenBalance[];
}

export interface GetOwnersForContractResponse {
  owners: ContractOwner[];
  pageKey?: string;
}

export interface GetOwnersForContractParams {
  contractAddress: string;
  chainId: number;
  withTokenBalances?: boolean;
  pageKey?: string;
}

@Injectable()
export class AlchemyService {
  private readonly logger = new Logger(AlchemyService.name);
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('ALCHEMY_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn(
        'ALCHEMY_API_KEY is not configured. NFT holder imports will not be available.'
      );
    } else {
      this.logger.log('Alchemy service initialized');
    }
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('ALCHEMY_API_KEY is required for NFT holder imports');
    }
  }

  private getNetworkFromChainId(chainId: number): Network {
    switch (chainId) {
      case 1:
        return Network.ETH_MAINNET;
      case 999:
        return Network.HYPERLIQUID_MAINNET;
      case 42161:
        return Network.ARB_MAINNET;
      case 80094:
        return Network.BERACHAIN_MAINNET;
      case 10:
        return Network.OPT_MAINNET;
      case 8453:
        return Network.BASE_MAINNET;
      default:
        this.logger.warn(`Unsupported chainId: ${chainId}, defaulting to Ethereum mainnet`);
        return Network.ETH_MAINNET;
    }
  }

  /**
   * Get all owners for a specific NFT contract
   * @param params - Parameters for the request
   * @returns Promise with owners data
   */
  async getOwnersForContract(
    params: GetOwnersForContractParams
  ): Promise<GetOwnersForContractResponse> {
    this.validateApiKey();
    try {
      this.logger.debug(
        `Getting owners for contract: ${params.contractAddress} on chain ${params.chainId}`
      );

      // Create Alchemy instance dynamically based on chainId
      const network = this.getNetworkFromChainId(params.chainId);
      const alchemy = new Alchemy({
        apiKey: this.apiKey,
        network,
      });

      const response = await alchemy.nft.getOwnersForContract(params.contractAddress, {
        withTokenBalances: params.withTokenBalances || false,
        pageKey: params.pageKey,
      });

      const owners: ContractOwner[] = response.owners.map((ownerData: any) => {
        // When withTokenBalances is false, owners is just an array of addresses
        if (typeof ownerData === 'string') {
          return {
            ownerAddress: ownerData,
          };
        }

        // When withTokenBalances is true, owners contains address and token balance info
        return {
          ownerAddress: ownerData.ownerAddress || ownerData,
          tokenBalances: ownerData.tokenBalances?.map((balance: any) => ({
            tokenId: balance.tokenId,
            balance: parseInt(balance.balance),
          })),
        };
      });

      this.logger.debug(
        `Found ${owners.length} owners for contract ${params.contractAddress} on chain ${params.chainId}`
      );

      return {
        owners,
        pageKey: response.pageKey,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get owners for contract ${params.contractAddress} on chain ${params.chainId}:`,
        error
      );
      throw new Error(`Failed to get owners for contract: ${error.message}`);
    }
  }
}
