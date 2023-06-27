import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: false});
  app.enableCors({credentials: true, origin: true})
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(5000);
}
bootstrap();