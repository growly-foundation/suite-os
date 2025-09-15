import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';

import { AppModule } from './modules/app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.set('trust proxy', 1);

  app.enableCors();

  // Configure Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(new ValidationPipe());
  app.useBodyParser('json', { limit: process.env.REQUEST_BODY_LIMIT || '10mb' });

  await app.listen(process.env.PORT ?? 8080);
}

bootstrap().catch(err => {
  console.error(err);
});
