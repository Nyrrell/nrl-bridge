import { Injectable, Logger, Inject } from '@nestjs/common';

import { DISCORD_DEALS_CONFIG, type DiscordDealsConfig } from './discord.config';
import { postToWebhook } from './discord-webhook';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import type { Item } from '../../core/interfaces/item.interface';
import type { Deal } from '../../plugins/deals/deal.types';
import type { DiscordEmbed } from './discord.types';

@Injectable()
export class DiscordDealsNotifier implements Notifier<Deal> {
  private readonly logger = new Logger(DiscordDealsNotifier.name);

  constructor(@Inject(DISCORD_DEALS_CONFIG) private readonly config: DiscordDealsConfig) {}

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

    const embeds: DiscordEmbed[] = deals.map((deal) => ({
      title: deal.title,
      description:
        deal.description.length > 200 ? deal.description.slice(0, 200) + '…' : deal.description,
      url: deal.url,
      color: 0x2ecc71,
      thumbnail: deal.thumbnailUrl ? { url: deal.thumbnailUrl } : undefined,
      fields: [
        { name: 'Original Price', value: deal.originalPrice, inline: true },
        {
          name: 'Free Until',
          value: deal.endDate
            ? new Date(deal.endDate).toLocaleDateString('fr-FR', { dateStyle: 'medium' })
            : 'Unknown',
          inline: true,
        },
      ],
      footer: { text: deal.store ? `Free on ${deal.store}` : '' },
    }));

    for (let i = 0; i < embeds.length; i += 10) {
      await postToWebhook(this.config.DISCORD_DEALS_WEBHOOK_URL, threadId, embeds.slice(i, i + 10));
    }
    this.logger.debug(`Sent ${embeds.length} embed(s) to Discord (plugin: ${deals[0].plugin})`);
  }
}
