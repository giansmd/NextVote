import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('BotBootstrap');
  const app = await NestFactory.createApplicationContext(AppModule);
  logger.log('Bot de Discord de NextVote iniciado correctamente.');
}

bootstrap();
