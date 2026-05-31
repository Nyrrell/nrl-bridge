import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { DiscordTwitchPrimeNotifier } from './discord-twitch-prime.notifier';
import { DiscordDealsNotifier } from './discord-deals.notifier';
import { resolveNotifierConfig } from '../notifier-config';
import { CoreModule } from '../../core/core.module';
import {
  DiscordDealsConfigSchema,
  DISCORD_DEALS_CONFIG,
  DiscordTwitchPrimeConfigSchema,
  DISCORD_TWITCH_PRIME_CONFIG,
} from './discord.config';

@Module({})
export class DiscordModule {
  static register(): DynamicModule {
    const logger = new Logger('DiscordModule');
    const providers = [];
    const exports = [];

    const dealsConfig = resolveNotifierConfig(
      DiscordDealsConfigSchema,
      [
        'DISCORD_DEALS_WEBHOOK_URL',
        'DISCORD_DEALS_EPIC_THREAD_ID',
        'DISCORD_DEALS_ITAD_THREAD_ID',
        'DISCORD_DEALS_PRIME_THREAD_ID',
      ],
      'Discord deals',
      logger,
    );
    if (dealsConfig) {
      providers.push(
        { provide: DISCORD_DEALS_CONFIG, useValue: dealsConfig },
        DiscordDealsNotifier,
      );
      exports.push(DiscordDealsNotifier);
    }

    const primeConfig = resolveNotifierConfig(
      DiscordTwitchPrimeConfigSchema,
      ['DISCORD_TWITCH_PRIME_WEBHOOK_URL', 'DISCORD_TWITCH_PRIME_THREAD_ID'],
      'Discord Twitch Prime',
      logger,
    );
    if (primeConfig) {
      providers.push(
        { provide: DISCORD_TWITCH_PRIME_CONFIG, useValue: primeConfig },
        DiscordTwitchPrimeNotifier,
      );
      exports.push(DiscordTwitchPrimeNotifier);
    }

    return {
      module: DiscordModule,
      imports: [CoreModule],
      providers,
      exports,
    };
  }
}
