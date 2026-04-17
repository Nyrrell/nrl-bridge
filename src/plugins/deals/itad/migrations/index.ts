import { sql } from 'kysely';

import type { Migration } from '../../../../core/migrations/migration-runner';

export const itadMigrations: Migration[] = [
  {
    name: 'itad:001_itad_deals',
    async up(db) {
      await db.schema
        .createTable('itad_deals')
        .ifNotExists()
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('source', 'text', (col) => col.notNull())
        .addColumn('game_slug', 'text', (col) => col.notNull())
        .addColumn('shop_id', 'text', (col) => col.notNull())
        .addColumn('shop_name', 'text', (col) => col.notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('url', 'text', (col) => col.notNull())
        .addColumn('original_price', 'text', (col) => col.notNull())
        .addColumn('end_date', 'text')
        .addColumn('seen_at', 'text', (col) => col.notNull())
        .execute();
    },
  },
  {
    name: 'itad:002_itad_deals_fk',
    async up(db) {
      await sql`PRAGMA foreign_keys = OFF`.execute(db);
      await sql`CREATE TABLE itad_deals_new (
        id TEXT NOT NULL PRIMARY KEY REFERENCES seen_items(id) ON DELETE CASCADE,
        source TEXT NOT NULL,
        game_slug TEXT NOT NULL,
        shop_id TEXT NOT NULL,
        shop_name TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        original_price TEXT NOT NULL,
        end_date TEXT,
        seen_at TEXT NOT NULL
      )`.execute(db);
      await sql`INSERT INTO itad_deals_new SELECT * FROM itad_deals`.execute(db);
      await sql`DROP TABLE itad_deals`.execute(db);
      await sql`ALTER TABLE itad_deals_new RENAME TO itad_deals`.execute(db);
      await sql`CREATE TRIGGER itad_deals_after_delete
        AFTER DELETE ON itad_deals BEGIN
          DELETE FROM seen_items WHERE id = OLD.id;
        END`.execute(db);
      await sql`PRAGMA foreign_keys = ON`.execute(db);
    },
  },
];
