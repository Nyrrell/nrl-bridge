import { Injectable, Inject, OnApplicationBootstrap, Logger } from '@nestjs/common';

import { DatabaseService, type CoreKysely } from '../database/database.service';

export const MIGRATIONS_TOKEN = 'MIGRATIONS_TOKEN';

export interface Migration {
  name: string; // e.g. "core:001_seen_items"
  up(db: CoreKysely): Promise<void>;
}

@Injectable()
export class MigrationRunner implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(
    private readonly dbService: DatabaseService,
    @Inject(MIGRATIONS_TOKEN) private readonly migrations: Migration[],
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.run();
  }

  async run(): Promise<void> {
    await this.dbService.db.schema
      .createTable('_migrations')
      .ifNotExists()
      .addColumn('name', 'text', (col) => col.primaryKey())
      .addColumn('run_at', 'text', (col) => col.notNull())
      .execute();

    const applied = await this.dbService.db.selectFrom('_migrations').select('name').execute();
    const appliedSet = new Set(applied.map((r) => r.name));

    const allMigrations = [...this.migrations];
    allMigrations.sort((a, b) => a.name.localeCompare(b.name));

    for (const migration of allMigrations) {
      if (appliedSet.has(migration.name)) continue;
      this.logger.log(`Applying migration: ${migration.name}`);
      await migration.up(this.dbService.db);
      await this.dbService.db
        .insertInto('_migrations')
        .values({ name: migration.name, run_at: new Date().toISOString() })
        .execute();
    }

    this.logger.log('All migrations applied.');
  }
}
