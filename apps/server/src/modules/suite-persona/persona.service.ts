import { Inject, Injectable } from '@nestjs/common';
import { SUPPORTED_CHAINS } from 'src/constants/chains';

import { Address, WalletGuildData } from '@getgrowly/persona';

import { PersonaClient } from '../persona/persona.provider';

@Injectable()
export class SuitePersonaService {
  constructor(@Inject('PERSONA_CLIENT') private readonly personaClient: PersonaClient) {}

  async fetchOnchainPersona(walletAddress: Address) {
    const analysis = await this.personaClient.buster.fetchActivityStats(
      walletAddress,
      SUPPORTED_CHAINS
    );
    const personaAnalysis = await this.personaClient.buster.fetchPersonaAnalysis(
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
