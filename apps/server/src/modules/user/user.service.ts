import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

import {
  ImportContractUserOutput,
  ParsedUser,
  ParsedUserPersona,
  SuiteDatabaseCore,
  UserImportSource,
  day,
  isStale,
} from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { SUITE_CORE } from '../../constants/services';
import { PERSONA_BUILD_JOB, PERSONA_QUEUE } from '../sync-persona/persona.queue';
import { UserImporterService } from './user-importer/user-importer.service';

export interface UniqueAddressesResponse {
  contractAddress: string;
  chainId: number;
  uniqueAddresses: string[];
  totalCount: number;
  transactionsAnalyzed: number;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore,
    @InjectQueue(PERSONA_QUEUE) private readonly personaQueue: Queue,
    private readonly userImporterService: UserImporterService
  ) {}

  async getUsers(): Promise<ParsedUser[]> {
    return this.suiteCore.users.getUsersByAgentId('all');
  }

  async getUserByAddress(address: string): Promise<ParsedUser | null> {
    return this.suiteCore.users.getUserByWalletAddress(address);
  }

  async getUserPersona(address: string): Promise<ParsedUserPersona | null> {
    return this.suiteCore.userPersonas.getOneByAddress(address);
  }

  async createUserIfNotExist(
    walletAddress: Address,
    organizationId: string,
    source: UserImportSource = UserImportSource.Native
  ): Promise<ParsedUser> {
    const {
      new: isNew,
      persona,
      user,
    } = await this.suiteCore.users.createUserFromAddressIfNotExist(walletAddress, organizationId, {
      source,
      sourceData: {},
    });
    if (!isNew) return user;

    // We will enqueue the build persona job if the last sync was more than stale time.
    if (persona?.last_synced_at && isStale(persona.last_synced_at, day(7))) {
      await this.personaQueue.add(
        PERSONA_BUILD_JOB,
        { walletAddress },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          // Only keep failed jobs for debugging
          removeOnComplete: true,
          removeOnFail: false,
        }
      );
    }
    return user;
  }

  /**
   * Imports contract users that have interacted with a specific contract
   */
  async importContractUsers(
    contractAddress: string,
    chainId: number
  ): Promise<ImportContractUserOutput[]> {
    return this.userImporterService.importContractUsers(contractAddress, chainId);
  }

  async importNftHolders(
    contractAddress: string,
    chainId: number
  ): Promise<ImportContractUserOutput[]> {
    return this.userImporterService.importNftHolders(contractAddress, chainId);
  }
}
