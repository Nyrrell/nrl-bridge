import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, type LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { STARTUP_TASKS_TOKEN, type StartupTask } from './core/startup.token';
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

  if (config.RUN_ON_STARTUP) {
    const startupLogger = new Logger('Startup');
    let tasks: StartupTask[] = [];
    try {
      tasks = app.get<StartupTask[]>(STARTUP_TASKS_TOKEN);
    } catch {
      // No plugins registered startup tasks
    }
    for (const task of tasks) {
      startupLogger.log(`Running ${task.constructor.name} on startup`);
      await task.handleCron();
    }
  }
}

bootstrap().catch((err: unknown) => {
  Logger.error('Fatal bootstrap error', err);
  process.exit(1);
});