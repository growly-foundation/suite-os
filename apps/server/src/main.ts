import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';
import { Resource } from 'x402-express';

import { AppModule } from './modules/app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  const payTo = process.env.ADDRESS as `0x${string}`;

  const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
  let network = process.env.NETWORK || 'base-sepolia';

  if (process.env.NODE_ENV === 'production') {
    network = 'base';
  }

  if (!facilitatorUrl || !payTo) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  app.enableCors();

  // TODO
  // const facilitatorOptions =
  //   process.env.NODE_ENV === 'production' ? facilitator : { url: facilitatorUrl };
  // app.use(
  //   paymentMiddleware(
  //     payTo,
  //     {
  //       // Route configurations for protected endpoints
  //       'POST /growly': {
  //         // USDC amount in dollars
  //         price: '$0.001',
  //         network,
  //       },
  //     },
  //     facilitatorOptions
  //   )
  // );

  app.enableCors();

  // Configure Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 8080);
}

bootstrap().catch(err => {
  console.error(err);
});
