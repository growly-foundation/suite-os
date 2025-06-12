import { Inject, Injectable } from '@nestjs/common';
import { SUPPORTED_CHAINS } from 'src/constants/chains';

import { Address, WalletGuildData } from '@getgrowly/persona';

import { SuitePersonaClient } from './persona.provider';

@Injectable()
export class PersonaService {
  constructor(@Inject('SUITE_PERSONA_CLIENT') private readonly personaClient: SuitePersonaClient) {}

  async fetchOnchainPersona(walletAddress: Address) {
    const analysis = await this.personaClient.onchainBuster.fetchActivityStats(
      walletAddress,
      SUPPORTED_CHAINS
    );
    const personaAnalysis = await this.personaClient.onchainBuster.fetchPersonaAnalysis(
      walletAddress,
      SUPPORTED_CHAINS
    );
    return {
      analysis,
      personaAnalysis,
    };
  }

  async fetchGuildPersona(walletAddress: Address): Promise<WalletGuildData> {
    return this.personaClient.guildXyz.getAggregatedWalletData(walletAddress);
  }
}
