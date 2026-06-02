import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { GotifyTwitchPrimeNotifier } from './gotify-twitch-prime.notifier';
import { GotifyDealsNotifier } from './gotify-deals.notifier';
import { buildNotifierModule } from '../notifier-module';
import {
  GotifyDealsConfigSchema,
  GOTIFY_DEALS_CONFIG,
  GotifyTwitchPrimeConfigSchema,
  GOTIFY_TWITCH_PRIME_CONFIG,
} from './gotify.config';

export const GOTIFY_NOTIFIERS = Symbol('GOTIFY_NOTIFIERS');

@Module({})
export class GotifyModule {
  static register(): DynamicModule {
    return buildNotifierModule({
      module: GotifyModule,
      logger: new Logger('GotifyModule'),
      aggregateToken: GOTIFY_NOTIFIERS,
      notifiers: [
        {
          schema: GotifyDealsConfigSchema,
          triggers: ['GOTIFY_EPIC_TOKEN', 'GOTIFY_ITAD_TOKEN', 'GOTIFY_PRIME_TOKEN'],
          label: 'Gotify deals',
          configToken: GOTIFY_DEALS_CONFIG,
          notifier: GotifyDealsNotifier,
        },
        {
          schema: GotifyTwitchPrimeConfigSchema,
          triggers: ['GOTIFY_TWITCH_PRIME_TOKEN'],
          label: 'Gotify Twitch Prime',
          configToken: GOTIFY_TWITCH_PRIME_CONFIG,
          notifier: GotifyTwitchPrimeNotifier,
        },
      ],
    });
  }
}