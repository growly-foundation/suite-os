import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EvmChainService, GuildXyzService, OnchainBusterService } from '@getgrowly/persona';

export interface SuitePersonaClient {
  buster: OnchainBusterService;
  guildXyz: GuildXyzService;
  evm: EvmChainService;
}

export const PersonaProvider: Provider = {
  provide: 'SUITE_PERSONA_CLIENT',
  inject: [ConfigService],
  useFactory: () => {
    const evmChainService = new EvmChainService();
    return {
      evm: evmChainService,
      buster: new OnchainBusterService(evmChainService),
      guildXyz: new GuildXyzService(),
    };
  },
};
