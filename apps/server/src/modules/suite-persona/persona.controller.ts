import { Body, Controller, Post } from '@nestjs/common';

import { Address } from '@getgrowly/persona';

import { PersonaService } from './persona.service';

@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post('guild')
  async fetchGuildPersona(@Body('walletAddress') walletAddress: Address) {
    return this.personaService.fetchGuildPersona(walletAddress);
  }

  @Post('onchain')
  async fetchOnchainPersona(@Body('walletAddress') walletAddress: Address) {
    return this.personaService.fetchOnchainPersona(walletAddress);
  }
}
