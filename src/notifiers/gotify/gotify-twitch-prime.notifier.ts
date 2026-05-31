import { Injectable, Inject } from '@nestjs/common';

import { GOTIFY_TWITCH_PRIME_CONFIG, type GotifyTwitchPrimeConfig } from './gotify.config';
import type { TwitchPrimeItem } from '../../plugins/twitch-prime/twitch-prime.types';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { buildTwitchPrimeMessage } from './templates/twitch-prime.message';
import type { Item } from '../../core/interfaces/item.interface';
import { postMessage } from './gotify-client';

@Injectable()
export class GotifyTwitchPrimeNotifier implements Notifier<TwitchPrimeItem> {
  constructor(
    @Inject(GOTIFY_TWITCH_PRIME_CONFIG) private readonly config: GotifyTwitchPrimeConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'twitch-prime';
  }

  async send(items: Item[]): Promise<void> {
    const primeItems = items as TwitchPrimeItem[];
    for (const item of primeItems) {
      const message = buildTwitchPrimeMessage(item, {
        priority: this.config.GOTIFY_TWITCH_PRIME_PRIORITY,
      });
      await postMessage(this.config.GOTIFY_URL, this.config.GOTIFY_TWITCH_PRIME_TOKEN, message);
    }
  }
}