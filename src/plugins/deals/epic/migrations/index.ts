import { sql } from 'kysely';

import type { Migration } from '../../../../core/migrations/migration-runner';

export const epicMigrations: Migration[] = [
  {
    name: 'epic:001_epic_deals',
    async up(db) {
      await db.schema
        .createTable('epic_deals')
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
    name: 'epic:002_epic_deals_fk',
    async up(db) {
      await sql`PRAGMA foreign_keys = OFF`.execute(db);
      await sql`CREATE TABLE epic_deals_new (
        id TEXT NOT NULL PRIMARY KEY REFERENCES seen_items(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        original_price TEXT NOT NULL,
        thumbnail_url TEXT NOT NULL,
        end_date TEXT,
        seen_at TEXT NOT NULL
      )`.execute(db);
      await sql`INSERT INTO epic_deals_new SELECT * FROM epic_deals`.execute(db);
      await sql`DROP TABLE epic_deals`.execute(db);
      await sql`ALTER TABLE epic_deals_new RENAME TO epic_deals`.execute(db);
      await sql`CREATE TRIGGER epic_deals_after_delete
        AFTER DELETE ON epic_deals BEGIN
          DELETE FROM seen_items WHERE id = OLD.id;
        END`.execute(db);
      await sql`PRAGMA foreign_keys = ON`.execute(db);
    },
  },
];
