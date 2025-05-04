import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LangchainService } from './langchain/langchain.service';
import { ChatController } from './chat/chat.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
@Module({
  controllers: [ChatController],
  providers: [LangchainService],
})
export class AppModule {}
