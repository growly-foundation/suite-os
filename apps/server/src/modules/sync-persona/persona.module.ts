import { BullModule, BullModule as NestBullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '../databases/database.module';
import { PersonaModule } from '../persona/persona.module';
import { PERSONA_QUEUE, PersonaQueueProcessor } from './persona.queue';
import { SyncPersonaService } from './persona.service';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    BullModule,
    NestBullModule.registerQueue({
      name: PERSONA_QUEUE,
    }),
    PersonaModule,
  ],
  providers: [SyncPersonaService, PersonaQueueProcessor],
  exports: [SyncPersonaService],
})
export class SyncPersonaModule {}
