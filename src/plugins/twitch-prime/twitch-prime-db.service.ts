import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../core/database/database.service';
import type { TwitchPrimePluginDb } from './twitch-prime.types';

@Injectable()
export class TwitchPrimeDbService {
  private readonly pluginDb: TwitchPrimePluginDb;

  constructor(dbService: DatabaseService) {
    this.pluginDb = dbService.db as unknown as TwitchPrimePluginDb;
  }

  async get(key: string): Promise<string | null> {
    const row = await this.pluginDb
      .selectFrom('twitch_prime_config')
      .select('value')
      .where('key', '=', key)
      .executeTakeFirst();
    return row?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    await this.pluginDb
      .insertInto('twitch_prime_config')
      .values({ key, value, updated_at: new Date().toISOString() })
      .onConflict((oc) =>
        oc.column('key').doUpdateSet({ value, updated_at: new Date().toISOString() }),
      )
      .execute();
  }
}
