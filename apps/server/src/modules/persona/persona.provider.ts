import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  EvmChainService,
  GuildXyzService,
  OnchainBusterService,
  TalentProtocolService,
} from '@getgrowly/persona';

import { Registry, chainsmithSdk } from '../../config/chainsmith';
import { SUPPORTED_CHAINS } from '../../constants/chains';

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
    const sdk = chainsmithSdk(SUPPORTED_CHAINS);
    const evmChainService = new EvmChainService(
      sdk,
      Registry.Adapters.Evmscan,
      Registry.Plugins.ZerionPortfolio
    );
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
