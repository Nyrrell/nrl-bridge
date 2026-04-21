import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { DiscordTwitchPrimeNotifier } from './discord-twitch-prime.notifier';
import { DiscordDealsNotifier } from './discord-deals.notifier';
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

    const dealsResult = DiscordDealsConfigSchema.safeParse(process.env);
    if (dealsResult.success) {
      providers.push(
        { provide: DISCORD_DEALS_CONFIG, useValue: dealsResult.data },
        DiscordDealsNotifier,
      );
      exports.push(DiscordDealsNotifier);
    } else {
      logger.warn('Deals notifier disabled - missing DISCORD_DEALS_WEBHOOK_URL');
    }

    const primeResult = DiscordTwitchPrimeConfigSchema.safeParse(process.env);
    if (primeResult.success) {
      providers.push(
        { provide: DISCORD_TWITCH_PRIME_CONFIG, useValue: primeResult.data },
        DiscordTwitchPrimeNotifier,
      );
      exports.push(DiscordTwitchPrimeNotifier);
    } else {
      logger.warn('Twitch Prime notifier disabled - missing DISCORD_TWITCH_PRIME_WEBHOOK_URL');
    }

    return {
      module: DiscordModule,
      imports: [CoreModule],
      providers,
      exports,
    };
  }
}
