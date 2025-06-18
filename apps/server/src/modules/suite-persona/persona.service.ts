import { Inject, Injectable } from '@nestjs/common';

import { Address, WalletGuildData } from '@getgrowly/persona';

import { PersonaClient } from '../persona/persona.provider';

@Injectable()
export class SuitePersonaService {
  constructor(@Inject('PERSONA_CLIENT') private readonly personaClient: PersonaClient) {}

  async fetchOnchainPersona(walletAddress: Address) {
    const analysis = await this.personaClient.buster.fetchActivityStats(walletAddress);
    const personaAnalysis = await this.personaClient.buster.fetchPersonaAnalysis(walletAddress);
    return {
      analysis,
      personaAnalysis,
    };
  }

  async fetchGuildPersona(walletAddress: Address): Promise<WalletGuildData> {
    return this.personaClient.guildXyz.getAggregatedWalletData(walletAddress);
  }
}
