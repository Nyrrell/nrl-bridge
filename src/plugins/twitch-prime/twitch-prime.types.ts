import type { Kysely } from 'kysely';

import type { Item } from '../../core/interfaces/item.interface';

export interface TwitchPrimeItem extends Item {
  source: 'twitch-prime';
  channel: string;
}

export interface TwitchPrimeConfigTable {
  key: string;
  value: string;
  updated_at: string;
}

export type TwitchPrimePluginDb = Kysely<{ twitch_prime_config: TwitchPrimeConfigTable }>;
