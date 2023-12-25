import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { CookieAuthSocketAdapter } from './gateway/gateway.adapter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  // app.useWebSocketAdapter(new CookieAuthSocketAdapter(app));
  app.enableCors({ credentials: true, origin: true });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(5000);
}
bootstrap();
