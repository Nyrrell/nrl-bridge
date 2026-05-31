import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { GotifyTwitchPrimeNotifier } from './gotify-twitch-prime.notifier';
import { GotifyDealsNotifier } from './gotify-deals.notifier';
import { resolveNotifierConfig } from '../notifier-config';
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

    const dealsConfig = resolveNotifierConfig(
      GotifyDealsConfigSchema,
      ['GOTIFY_EPIC_TOKEN', 'GOTIFY_ITAD_TOKEN', 'GOTIFY_PRIME_TOKEN'],
      'Gotify deals',
      logger,
    );
    if (dealsConfig) {
      providers.push(
        { provide: GOTIFY_DEALS_CONFIG, useValue: dealsConfig },
        GotifyDealsNotifier,
      );
      exports.push(GotifyDealsNotifier);
    }

    const primeConfig = resolveNotifierConfig(
      GotifyTwitchPrimeConfigSchema,
      ['GOTIFY_TWITCH_PRIME_TOKEN'],
      'Gotify Twitch Prime',
      logger,
    );
    if (primeConfig) {
      providers.push(
        { provide: GOTIFY_TWITCH_PRIME_CONFIG, useValue: primeConfig },
        GotifyTwitchPrimeNotifier,
      );
      exports.push(GotifyTwitchPrimeNotifier);
    }

    return {
      module: GotifyModule,
      imports: [CoreModule],
      providers,
      exports,
    };
  }
}