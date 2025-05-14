import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { paymentMiddleware, Resource } from 'x402-express';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);

  const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
  const payTo = process.env.ADDRESS as `0x${string}`;
  const network = process.env.NETWORK || 'base-sepolia';

  if (!facilitatorUrl || !payTo) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  app.use(
    paymentMiddleware(
      payTo,
      {
        // Route configurations for protected endpoints
        'POST /growly': {
          // USDC amount in dollars
          price: '$0.001',
          network,
        },
      },
      {
        url: facilitatorUrl,
      }
    )
  );

  app.enableCors();
  await app.listen(process.env.PORT ?? 8080);
}

bootstrap().catch(err => {
  console.error(err);
});
