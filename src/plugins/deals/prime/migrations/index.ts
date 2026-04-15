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
];
