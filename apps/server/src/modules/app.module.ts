import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { ProxyMiddleware } from '../middleware/x402-redirect.middleware';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './databases/database.module';
import { GrowlyModule } from './growly/growly.module';
import { MessageModule } from './message/message.module';
import { OpenAIModule } from './openai/openai.module';
import { PersonaModule } from './persona/persona.module';
import { SuiteCoreModule } from './suite-core/suite-core.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PersonaModule,
    DatabaseModule,
    OpenAIModule,
    ChatModule,
    MessageModule,
    GrowlyModule,
    SuiteCoreModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('chat');
  }
}
