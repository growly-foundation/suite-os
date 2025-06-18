import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PersonaModule } from '../persona/persona.module';
import { SuitePersonaController } from './persona.controller';
import { SuitePersonaService } from './persona.service';

@Module({
  imports: [ConfigModule, PersonaModule],
  providers: [SuitePersonaService],
  controllers: [SuitePersonaController],
})
export class SuitePersonaModule {}
