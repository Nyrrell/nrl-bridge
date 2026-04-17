import { Kysely, SqliteDialect } from 'kysely';
import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';

interface SeenItemsTable {
  id: string;
  source: string;
  seen_at: string;
}

interface CoreSchema {
  seen_items: SeenItemsTable;
  _migrations: { name: string; run_at: string };
}

export type CoreKysely = Kysely<CoreSchema>;

@Injectable()
export class DatabaseService {
  readonly db: CoreKysely;

  constructor(dbPath: string) {
    const database = new Database(dbPath);
    database.pragma('foreign_keys = ON');
    this.db = new Kysely<CoreSchema>({
      dialect: new SqliteDialect({ database }),
    });
  }
}
