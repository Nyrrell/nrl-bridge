import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, type LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { loadAppConfig } from './core/config';
import { AppModule } from './app.module';

const LOG_LEVEL_MAP: Record<string, LogLevel[]> = {
  debug: ['debug', 'verbose', 'log', 'warn', 'error', 'fatal'],
  info: ['log', 'warn', 'error', 'fatal'],
  warn: ['warn', 'error', 'fatal'],
  error: ['error', 'fatal'],
};

async function bootstrap(): Promise<void> {
  const config = loadAppConfig();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    logger: LOG_LEVEL_MAP[config.LOG_LEVEL],
  });
  await app.listen(config.PORT, '0.0.0.0');
  Logger.log(`nrl-bridge listening on port ${config.PORT}`);
}

bootstrap().catch((err: unknown) => {
  Logger.error('Fatal bootstrap error', err);
  process.exit(1);
});
