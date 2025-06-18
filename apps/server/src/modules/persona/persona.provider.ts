import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  EvmChainService,
  GuildXyzService,
  OnchainBusterService,
  TalentProtocolService,
} from '@getgrowly/persona';

export interface PersonaClient {
  buster: OnchainBusterService;
  guildXyz: GuildXyzService;
  evm: EvmChainService;
  talent: TalentProtocolService;
}

export const PersonaProvider: Provider = {
  provide: 'PERSONA_CLIENT',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): PersonaClient => {
    const evmChainService = new EvmChainService();
    return {
      evm: evmChainService,
      buster: new OnchainBusterService(evmChainService),
      guildXyz: new GuildXyzService(),
      talent: new TalentProtocolService(
        configService.get('TALENT_API_KEY') || '',
        'https://api.talentprotocol.com'
      ),
    };
  },
};
