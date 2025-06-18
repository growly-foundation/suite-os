import { Body, Controller, Post } from '@nestjs/common';

import { Address } from '@getgrowly/persona';

import { SuitePersonaService } from './persona.service';

@Controller('persona')
export class SuitePersonaController {
  constructor(private readonly personaService: SuitePersonaService) {}

  @Post('guild')
  async fetchGuildPersona(@Body('walletAddress') walletAddress: Address) {
    return this.personaService.fetchGuildPersona(walletAddress);
  }

  @Post('onchain')
  async fetchOnchainPersona(@Body('walletAddress') walletAddress: Address) {
    return this.personaService.fetchOnchainPersona(walletAddress);
  }
}
