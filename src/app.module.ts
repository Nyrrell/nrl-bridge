import { Module } from '@nestjs/common';

import { MigrationRunner, MIGRATIONS_TOKEN } from './core/migrations/migration-runner';
import { PrimeModule, PrimeScheduler, primeMigrations } from './plugins/deals/prime';
import { EpicModule, EpicScheduler, epicMigrations } from './plugins/deals/epic';
import { ItadModule, ItadScheduler, itadMigrations } from './plugins/deals/itad';
import { STARTUP_TASKS_TOKEN, type StartupTask } from './core/startup.token';
import { TestModule } from './notifiers/test/test.module';
import { coreMigrations } from './core/migrations';
import { CoreModule } from './core/core.module';
import {
  TwitchPrimeModule,
  TwitchPrimeScheduler,
  twitchPrimeMigrations,
} from './plugins/twitch-prime';

@Module({
  imports: [
    CoreModule,
    PrimeModule.register(),
    EpicModule.register(),
    ItadModule.register(),
    TwitchPrimeModule.register(),
    TestModule.register(),
  ],
  providers: [
    MigrationRunner,
    {
      provide: MIGRATIONS_TOKEN,
      useValue: [
        ...coreMigrations,
        ...primeMigrations,
        ...epicMigrations,
        ...itadMigrations,
        ...twitchPrimeMigrations,
      ],
    },
    {
      provide: STARTUP_TASKS_TOKEN,
      useFactory: (...tasks: (StartupTask | undefined)[]): StartupTask[] =>
        tasks.filter((t): t is StartupTask => t !== undefined),
      inject: [
        { token: PrimeScheduler, optional: true },
        { token: EpicScheduler, optional: true },
        { token: ItadScheduler, optional: true },
        { token: TwitchPrimeScheduler, optional: true },
      ],
    },
  ],
})
export class AppModule {}
