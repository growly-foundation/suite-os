import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseProvider } from './supabase.provider';
import { SupabaseService } from './supabase.service';
import { OpenAIModule } from '../openai/openai.module';
import { SupabaseMessageRepository } from './repositories/supabase-message.repository';
import { MessageService } from './services/message.service';

@Module({
  imports: [ConfigModule, OpenAIModule],
  providers: [
    SupabaseProvider,
    SupabaseService,
    SupabaseMessageRepository,
    {
      provide: 'MessageRepository',
      useClass: SupabaseMessageRepository,
    },
    MessageService,
  ],
  exports: [SupabaseProvider, SupabaseService, MessageService],
})
export class SupabaseModule {}
