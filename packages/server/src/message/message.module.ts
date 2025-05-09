import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageRepository } from './message.repository';

@Module({
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
