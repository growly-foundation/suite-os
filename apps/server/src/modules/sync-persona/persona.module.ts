import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { PersonaModule } from '../persona/persona.module';
import { SyncPersonaService } from './persona.service';

@Module({
  imports: [ConfigModule, DatabaseModule, PersonaModule],
  providers: [SyncPersonaService],
  exports: [],
})
export class SyncPersonaModule {}
