import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from '../openai/openai.module';
import { SupabaseMessageRepository } from './repositories/supabase-message.repository';
import { MessageService } from './services/message.service';
import { SuiteCoreProvider } from './suite.provider';

@Module({
  imports: [ConfigModule, OpenAIModule],
  providers: [
    SuiteCoreProvider,
    SupabaseMessageRepository,
    {
      provide: 'MessageRepository',
      useClass: SupabaseMessageRepository,
    },
    MessageService,
  ],
  exports: [SuiteCoreProvider, MessageService],
})
export class SupabaseModule {}
