import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PersonaProvider } from './persona.provider';

@Module({
  imports: [ConfigModule],
  providers: [PersonaProvider],
  exports: [PersonaProvider],
})
export class PersonaModule {}
