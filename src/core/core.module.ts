import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { HealthController } from './health.controller';
import { loadAppConfig, APP_CONFIG } from './config';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: () => loadAppConfig(),
    },
    AdminGuard,
  ],
  exports: [APP_CONFIG, DatabaseModule, AdminGuard],
})
export class CoreModule {}
