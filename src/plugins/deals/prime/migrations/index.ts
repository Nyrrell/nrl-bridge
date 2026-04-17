import { sql } from 'kysely';

import type { Migration } from '../../../../core/migrations/migration-runner';

export const primeMigrations: Migration[] = [
  {
    name: 'prime:001_prime_deals',
    async up(db) {
      await db.schema
        .createTable('prime_deals')
        .ifNotExists()
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('source', 'text', (col) => col.notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('url', 'text', (col) => col.notNull())
        .addColumn('original_price', 'text', (col) => col.notNull())
        .addColumn('thumbnail_url', 'text', (col) => col.notNull())
        .addColumn('end_date', 'text')
        .addColumn('seen_at', 'text', (col) => col.notNull())
        .execute();
    },
  },
  {
    name: 'prime:002_prime_deals_fk',
    async up(db) {
      await sql`PRAGMA foreign_keys = OFF`.execute(db);
      await sql`CREATE TABLE prime_deals_new (
        id TEXT NOT NULL PRIMARY KEY REFERENCES seen_items(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        original_price TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        end_date TEXT,
        seen_at TEXT NOT NULL
      )`.execute(db);
      await sql`INSERT INTO prime_deals_new SELECT * FROM prime_deals`.execute(db);
      await sql`DROP TABLE prime_deals`.execute(db);
      await sql`ALTER TABLE prime_deals_new RENAME TO prime_deals`.execute(db);
      await sql`CREATE TRIGGER prime_deals_after_delete
        AFTER DELETE ON prime_deals BEGIN
          DELETE FROM seen_items WHERE id = OLD.id;
        END`.execute(db);
      await sql`PRAGMA foreign_keys = ON`.execute(db);
    },
  },
];
