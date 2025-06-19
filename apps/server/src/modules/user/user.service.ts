import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bull';

import { ParsedUser, ParsedUserPersona, SuiteDatabaseCore } from '@getgrowly/core';
import { Address } from '@getgrowly/persona';

import { SUITE_CORE } from '../../constants/services';
import { PERSONA_BUILD_JOB, PERSONA_QUEUE } from '../sync-persona/persona.queue';

@Injectable()
export class UserService {
  constructor(
    @Inject(SUITE_CORE) private readonly suiteCore: SuiteDatabaseCore,
    @InjectQueue(PERSONA_QUEUE) private readonly personaQueue: Queue
  ) {}

  async getUserPersona(walletAddress: Address): Promise<ParsedUserPersona | null> {
    return this.suiteCore.userPersonas.getOneByAddress(walletAddress);
  }

  async createUserIfNotExist(walletAddress: Address): Promise<ParsedUser | null> {
    const { new: isNew, user } =
      await this.suiteCore.users.createUserFromAddressIfNotExist(walletAddress);
    if (!isNew) return user;

    // If the user is new, we will enqueue the build persona job.
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
    return user;
  }
}
