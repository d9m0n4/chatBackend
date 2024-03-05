import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: 'https://chat-194.vercel.app',
      credentials: true,
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Methods',
        'Access-Control-Request-Headers',
        'Access-Control-Allow-Origin',
      ],
    },
  });
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.use(cookieParser());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.APP_PORT);
}
bootstrap();
