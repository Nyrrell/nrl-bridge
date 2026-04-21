import type { Migration } from '../../../core/migrations/migration-runner';

export const twitchPrimeMigrations: Migration[] = [
  {
    name: 'twitch-prime:001_twitch_prime_config',
    async up(db) {
      await db.schema
        .createTable('twitch_prime_config')
        .ifNotExists()
        .addColumn('key', 'text', (col) => col.primaryKey())
        .addColumn('value', 'text', (col) => col.notNull())
        .addColumn('updated_at', 'text', (col) => col.notNull())
        .execute();
    },
  },
];
