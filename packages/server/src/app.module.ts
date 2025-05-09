import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { OpenAIModule } from './openai/openai.module';
import { DatabaseModule } from './databases/database.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, OpenAIModule, ChatModule],
})
export class AppModule {}
