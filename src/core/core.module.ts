import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { loadAppConfig, APP_CONFIG } from './config';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: () => loadAppConfig(),
    },
  ],
  exports: [APP_CONFIG, DatabaseModule],
})
export class CoreModule {}
