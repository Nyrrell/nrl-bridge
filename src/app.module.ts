import { Module } from '@nestjs/common';

import { MigrationRunner, MIGRATIONS_TOKEN } from './core/migrations/migration-runner';
import { EpicModule, EpicScheduler, epicMigrations } from './plugins/deals/epic';
import { ItadModule, ItadScheduler, itadMigrations } from './plugins/deals/itad';
import { STARTUP_TASKS_TOKEN, type StartupTask } from './core/startup.token';
import { coreMigrations } from './core/migrations';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule, EpicModule.register(), ItadModule.register()],
  providers: [
    MigrationRunner,
    {
      provide: MIGRATIONS_TOKEN,
      useValue: [...coreMigrations, ...epicMigrations, ...itadMigrations],
    },
    {
      provide: STARTUP_TASKS_TOKEN,
      useFactory: (...tasks: (StartupTask | undefined)[]): StartupTask[] =>
        tasks.filter((t): t is StartupTask => t !== undefined),
      inject: [
        { token: EpicScheduler, optional: true },
        { token: ItadScheduler, optional: true },
      ],
    },
  ],
})
export class AppModule {}
