import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { GotifyTwitchPrimeNotifier } from './gotify-twitch-prime.notifier';
import { GotifyDealsNotifier } from './gotify-deals.notifier';
import { CoreModule } from '../../core/core.module';
import {
  GotifyDealsConfigSchema,
  GOTIFY_DEALS_CONFIG,
  GotifyTwitchPrimeConfigSchema,
  GOTIFY_TWITCH_PRIME_CONFIG,
} from './gotify.config';

@Module({})
export class GotifyModule {
  static register(): DynamicModule {
    const logger = new Logger('GotifyModule');
    const providers = [];
    const exports = [];

    const dealsResult = GotifyDealsConfigSchema.safeParse(process.env);
    if (dealsResult.success) {
      providers.push(
        { provide: GOTIFY_DEALS_CONFIG, useValue: dealsResult.data },
        GotifyDealsNotifier,
      );
      exports.push(GotifyDealsNotifier);
    } else {
      logger.warn(
        'Deals notifier disabled - missing GOTIFY_URL or no GOTIFY_(EPIC|ITAD|PRIME)_TOKEN set',
      );
    }

    const primeResult = GotifyTwitchPrimeConfigSchema.safeParse(process.env);
    if (primeResult.success) {
      providers.push(
        { provide: GOTIFY_TWITCH_PRIME_CONFIG, useValue: primeResult.data },
        GotifyTwitchPrimeNotifier,
      );
      exports.push(GotifyTwitchPrimeNotifier);
    } else {
      logger.warn('Twitch Prime notifier disabled - missing GOTIFY_URL or GOTIFY_TWITCH_PRIME_TOKEN');
    }

    return {
      module: GotifyModule,
      imports: [CoreModule],
      providers,
      exports,
    };
  }
}