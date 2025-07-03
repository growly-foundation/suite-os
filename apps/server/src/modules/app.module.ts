import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { ProxyMiddleware } from '../middleware/x402-redirect.middleware';
import { BullModule } from './bull/bull.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './databases/database.module';
import { GrowlyModule } from './growly/growly.module';
import { MessageModule } from './message/message.module';
import { OpenAIModule } from './openai/openai.module';
import { ResourcesModule } from './resources/resources.module';
import { SuiteCoreModule } from './suite-core/suite-core.module';
import { SyncPersonaModule } from './sync-persona/persona.module';
import { UserModule } from './user/user.module';

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
    GrowlyModule,
    SuiteCoreModule,
    ResourcesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('chat');
  }
}
