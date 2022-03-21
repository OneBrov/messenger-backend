import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    credentials: true,
    origin: process.env.CLIENT,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(5000);
}
bootstrap();
