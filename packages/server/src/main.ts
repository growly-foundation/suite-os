import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.ts';

async function bootstrap() {
  const PORT = 8080;
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(PORT);

  console.log('Successfully start server at port: ', PORT);
}
bootstrap();
