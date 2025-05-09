import { Module } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { DatabaseModule } from 'src/databases/database.module';
import { OpenAIModule } from 'src/openai/openai.module';

@Module({
  imports: [DatabaseModule, OpenAIModule],
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
