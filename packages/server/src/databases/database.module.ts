import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from '../openai/openai.module';
import { MessageRepository } from '../message/message.repository';
import { MessageService } from '../message/message.service';
import { SuiteCoreProvider } from './suite.provider';

@Module({
  imports: [ConfigModule, OpenAIModule],
  providers: [
    SuiteCoreProvider,
    MessageRepository,
    {
      provide: 'MessageRepository',
      useClass: MessageRepository,
    },
    MessageService,
  ],
  exports: [SuiteCoreProvider, MessageService],
})
export class DatabaseModule {}
