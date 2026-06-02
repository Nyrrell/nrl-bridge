import { Module, Logger, type DynamicModule } from '@nestjs/common';

import { DiscordTwitchPrimeNotifier } from './discord-twitch-prime.notifier';
import { DiscordDealsNotifier } from './discord-deals.notifier';
import { buildNotifierModule } from '../notifier-module';
import {
  DiscordDealsConfigSchema,
  DISCORD_DEALS_CONFIG,
  DiscordTwitchPrimeConfigSchema,
  DISCORD_TWITCH_PRIME_CONFIG,
} from './discord.config';

export const DISCORD_NOTIFIERS = Symbol('DISCORD_NOTIFIERS');

@Module({})
export class DiscordModule {
  static register(): DynamicModule {
    return buildNotifierModule({
      module: DiscordModule,
      logger: new Logger('DiscordModule'),
      aggregateToken: DISCORD_NOTIFIERS,
      notifiers: [
        {
          schema: DiscordDealsConfigSchema,
          triggers: [
            'DISCORD_DEALS_WEBHOOK_URL',
            'DISCORD_DEALS_EPIC_THREAD_ID',
            'DISCORD_DEALS_ITAD_THREAD_ID',
            'DISCORD_DEALS_PRIME_THREAD_ID',
          ],
          label: 'Discord deals',
          configToken: DISCORD_DEALS_CONFIG,
          notifier: DiscordDealsNotifier,
        },
        {
          schema: DiscordTwitchPrimeConfigSchema,
          triggers: ['DISCORD_TWITCH_PRIME_WEBHOOK_URL', 'DISCORD_TWITCH_PRIME_THREAD_ID'],
          label: 'Discord Twitch Prime',
          configToken: DISCORD_TWITCH_PRIME_CONFIG,
          notifier: DiscordTwitchPrimeNotifier,
        },
      ],
    });
  }
}