import { Injectable } from '@nestjs/common';
import {
  TMultichain,
  TChainId,
  TTokenTransferActivity,
  TChainMetadataListResponse,
} from 'chainsmith-sdk/types';
import { chainsmithSdk } from '../../config/index.ts';

@Injectable()
export class ChainService {
  getChainMetadata(chainId: TChainId): Promise<TChainMetadataListResponse> {
    return chainsmithSdk().evmChain.getChainMetadata(chainId);
  }

  getAllChainMetadata(): Promise<TMultichain<TTokenTransferActivity[]>> {
    return chainsmithSdk().evmChain.getAllChainMetadata();
  }
}
