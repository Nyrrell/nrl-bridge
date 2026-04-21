import { Injectable, Inject } from '@nestjs/common';

import { DISCORD_TWITCH_PRIME_CONFIG, type DiscordTwitchPrimeConfig } from './discord.config';
import type { TwitchPrimeItem } from '../../plugins/twitch-prime/twitch-prime.types';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { buildTwitchPrimeEmbed } from './templates/twitch-prime.embed';
import type { Item } from '../../core/interfaces/item.interface';
import { postToWebhook } from './discord-webhook';

@Injectable()
export class DiscordTwitchPrimeNotifier implements Notifier<TwitchPrimeItem> {
  constructor(
    @Inject(DISCORD_TWITCH_PRIME_CONFIG) private readonly config: DiscordTwitchPrimeConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'twitch-prime';
  }

  async send(items: Item[]): Promise<void> {
    const primeItems = items as TwitchPrimeItem[];
    for (const item of primeItems) {
      await postToWebhook(
        this.config.DISCORD_TWITCH_PRIME_WEBHOOK_URL,
        this.config.DISCORD_TWITCH_PRIME_THREAD_ID,
        [buildTwitchPrimeEmbed(item)],
      );
    }
  }
}
