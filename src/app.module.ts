import { Module } from '@nestjs/common';

import { MigrationRunner, MIGRATIONS_TOKEN } from './core/migrations/migration-runner';
import { EpicModule, epicMigrations } from './plugins/deals/epic';
import { ItadModule, itadMigrations } from './plugins/deals/itad';
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
  ],
})
export class AppModule {}
