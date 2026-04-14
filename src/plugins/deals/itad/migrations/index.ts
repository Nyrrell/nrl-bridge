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
];
