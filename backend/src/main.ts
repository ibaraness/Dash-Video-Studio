import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NEST_MODE === 'dev' ? undefined : false,
  });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    disableErrorMessages: false
  }));
  await app.listen(3000);
}
bootstrap();
