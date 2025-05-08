import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AgentModule } from '../agent/agent.module';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [AgentModule, SupabaseModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
