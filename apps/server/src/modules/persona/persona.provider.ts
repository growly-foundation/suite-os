import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  EvmChainService,
  GuildXyzService,
  NameService,
  OnchainBusterService,
  TalentProtocolService,
} from '@getgrowly/persona';

import { initializeChainsmith } from '../../config/chainsmith';
import { SUPPORTED_CHAINS } from '../../constants/chains';
import { PERSONA_CLIENT } from '../../constants/services';

export interface PersonaClient {
  buster: OnchainBusterService;
  guildXyz: GuildXyzService;
  evm: EvmChainService;
  talent: TalentProtocolService;
}

export const PersonaProvider: Provider = {
  provide: PERSONA_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): PersonaClient => {
    const { sdk, registry } = initializeChainsmith(configService);
    const evmChainService = new EvmChainService(
      sdk(SUPPORTED_CHAINS),
      registry.Adapters.Evmscan,
      registry.Plugins.ZerionPortfolio
    );
    const nameService = new NameService();
    return {
      evm: evmChainService,
      buster: new OnchainBusterService(evmChainService, nameService),
      guildXyz: new GuildXyzService(),
      talent: new TalentProtocolService(
        configService.get('TALENT_API_KEY') || '',
        'https://api.talentprotocol.com'
      ),
    };
  },
};
