import { Module } from '@nestjs/common';

import { DatabaseModule } from '../databases/database.module';
import { QueueModule } from '../queue/queue.module';
import { PersonaService } from './persona.service';

@Module({
  imports: [DatabaseModule, QueueModule],
  providers: [PersonaService],
  exports: [],
})
export class PersonaModule {}
