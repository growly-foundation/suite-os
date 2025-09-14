import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AlchemyModule } from './alchemy/alchemy.module';
import { BullModule } from './bull/bull.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './databases/database.module';
import { EtherscanModule } from './etherscan/etherscan.module';
import { MessageModule } from './message/message.module';
import { OpenAIModule } from './openai/openai.module';
import { QueueModule } from './queue/queue.module';
import { ResourcesModule } from './resources/resources.module';
import { SuiteCoreModule } from './suite-core/suite-core.module';
import { SyncPersonaModule } from './sync-persona/persona.module';
import { UserModule } from './user/user.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    UserModule,
    BullModule,
    SyncPersonaModule,
    DatabaseModule,
    OpenAIModule,
    ChatModule,
    MessageModule,
    QueueModule,
    SuiteCoreModule,
    ResourcesModule,
    EtherscanModule,
    WebSocketModule,
    AlchemyModule,
  ],
})
export class AppModule {}
