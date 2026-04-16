import { Injectable, Logger, Inject } from '@nestjs/common';

import { DISCORD_DEALS_CONFIG, type DiscordDealsConfig } from './discord.config';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import type { Item } from '../../core/interfaces/item.interface';
import { APP_CONFIG, type AppConfig } from '../../core/config';
import { buildDealsEmbeds } from './templates/deals.embed';
import type { Deal } from '../../plugins/deals/deal.types';
import { postToWebhook } from './discord-webhook';

@Injectable()
export class DiscordDealsNotifier implements Notifier<Deal> {
  private readonly logger = new Logger(DiscordDealsNotifier.name);

  constructor(
    @Inject(DISCORD_DEALS_CONFIG) private readonly config: DiscordDealsConfig,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'deals';
  }

  async send(items: Item[]): Promise<void> {
    const deals = items as Deal[];
    if (deals.length === 0) return;

    const threadIdByPlugin: Record<string, string | undefined> = {
      epic: this.config.DISCORD_DEALS_EPIC_THREAD_ID,
      itad: this.config.DISCORD_DEALS_ITAD_THREAD_ID,
      prime: this.config.DISCORD_DEALS_PRIME_THREAD_ID,
    };

    const threadId = threadIdByPlugin[deals[0].plugin];
    const embeds = buildDealsEmbeds(deals, {
      locale: this.appConfig.LOCALE,
      timezone: this.appConfig.TIMEZONE,
    });

    for (let i = 0; i < embeds.length; i += 10) {
      await postToWebhook(this.config.DISCORD_DEALS_WEBHOOK_URL, threadId, embeds.slice(i, i + 10));
    }
    this.logger.debug(`Sent ${embeds.length} embed(s) to Discord (plugin: ${deals[0].plugin})`);
  }
}
