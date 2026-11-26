import { Injectable, Inject } from '@nestjs/common';

import { WEBHOOK_TWITCH_PRIME_CONFIG, type WebhookTwitchPrimeConfig } from './webhook.config';
import type { TwitchPrimeItem } from '../../plugins/twitch-prime/twitch-prime.types';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { buildTwitchPrimeMessage } from './templates/twitch-prime.message';
import type { Item } from '../../core/interfaces/item.interface';
import { postMessage } from './webhook-client';

@Injectable()
export class WebhookTwitchPrimeNotifier implements Notifier<TwitchPrimeItem> {
  constructor(
    @Inject(WEBHOOK_TWITCH_PRIME_CONFIG) private readonly config: WebhookTwitchPrimeConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'twitch-prime';
  }

  async send(items: Item[]): Promise<void> {
    const primeItems = items as TwitchPrimeItem[];
    for (const item of primeItems) {
      const message = buildTwitchPrimeMessage(item, {
        priority: this.config.WEBHOOK_TWITCH_PRIME_PRIORITY,
        sender: this.config.WEBHOOK_SENDER,
      });
      await postMessage(this.config.WEBHOOK_URL, this.config.WEBHOOK_TWITCH_PRIME_TOKEN, message);
    }
  }
}
