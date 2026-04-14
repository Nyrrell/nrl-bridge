import type { Migration } from './migration-runner';

export const coreMigrations: Migration[] = [
  {
    name: 'core:001_seen_items',
    async up(db) {
      await db.schema
        .createTable('seen_items')
        .ifNotExists()
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('source', 'text', (col) => col.notNull())
        .addColumn('seen_at', 'text', (col) => col.notNull())
        .execute();
    },
  },
];
