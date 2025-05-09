import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from '../openai/openai.module';
import { MessageDatabaseRepository } from '../repositories/supabase-message.repository';
import { MessageService } from '../services/message.service';
import { SuiteCoreProvider } from './suite.provider';

@Module({
  imports: [ConfigModule, OpenAIModule],
  providers: [
    SuiteCoreProvider,
    MessageDatabaseRepository,
    {
      provide: 'MessageRepository',
      useClass: MessageDatabaseRepository,
    },
    MessageService,
  ],
  exports: [SuiteCoreProvider, MessageService],
})
export class DatabaseModule {}
