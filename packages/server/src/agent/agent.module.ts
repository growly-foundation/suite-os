import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [ConfigModule, SupabaseModule],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
