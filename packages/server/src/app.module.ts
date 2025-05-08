import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { OpenAIModule } from './openai/openai.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), OpenAIModule, SupabaseModule, ChatModule],
})
export class AppModule {}
