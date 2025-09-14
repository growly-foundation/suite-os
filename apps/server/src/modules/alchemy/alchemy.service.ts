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
      throw new Error('ALCHEMY_API_KEY is required');
    }

    this.logger.log('Alchemy service initialized');
  }

  private getNetworkFromChainId(chainId: number): Network {
    switch (chainId) {
      case 1:
        return Network.ETH_MAINNET;
      case 11155111:
        return Network.ETH_SEPOLIA;
      case 137:
        return Network.MATIC_MAINNET;
      case 42161:
        return Network.ARB_MAINNET;
      case 421614:
        return Network.ARB_SEPOLIA;
      case 10:
        return Network.OPT_MAINNET;
      case 11155420:
        return Network.OPT_SEPOLIA;
      case 8453:
        return Network.BASE_MAINNET;
      case 84532:
        return Network.BASE_SEPOLIA;
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
