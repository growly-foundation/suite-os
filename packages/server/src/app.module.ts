import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { OpenAIModule } from './openai/openai.module';
import { DatabaseModule } from './databases/database.module';
import { MessageModule } from './message/message.module';
import { GrowlyModule } from './growly/growly.module';
import { ProxyMiddleware } from './middleware/x402-redirect.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    OpenAIModule,
    ChatModule,
    MessageModule,
    GrowlyModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('chat');
  }
}
