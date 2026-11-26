import { Injectable, Inject } from '@nestjs/common';

import { WEBHOOK_TWITCH_PRIME_CONFIG, type WebhookTwitchPrimeConfig } from './webhook.config';
import type { TwitchPrimeItem } from '../../plugins/twitch-prime/twitch-prime.types';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { twitchPrimeVars } from './templates/twitch-prime.template';
import type { Item } from '../../core/interfaces/item.interface';
import { buildTarget, postJson } from './webhook-client';
import { renderTemplate } from './webhook-template';

@Injectable()
export class WebhookTwitchPrimeNotifier implements Notifier<TwitchPrimeItem> {
  constructor(
    @Inject(WEBHOOK_TWITCH_PRIME_CONFIG) private readonly config: WebhookTwitchPrimeConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'twitch-prime';
  }

  async send(items: Item[]): Promise<void> {
    const target = buildTarget(
      this.config.WEBHOOK_URL,
      this.config.WEBHOOK_AUTH_HEADER,
      this.config.WEBHOOK_TWITCH_PRIME_TOKEN,
    );
    for (const item of items as TwitchPrimeItem[]) {
      const body = renderTemplate(this.config.WEBHOOK_TWITCH_PRIME_TEMPLATE, twitchPrimeVars(item));
      await postJson(target, body);
    }
  }
}
