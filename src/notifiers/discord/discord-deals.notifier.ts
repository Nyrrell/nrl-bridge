import { Injectable, Logger, Inject } from '@nestjs/common';

import { DISCORD_DEALS_CONFIG, type DiscordDealsConfig } from './discord.config';
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
    const embeds: DiscordEmbed[] = deals.map((deal) => ({
      title: `${deal.title}`,
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
            ? new Date(deal.endDate).toLocaleDateString('fr-FR', {
                dateStyle: 'medium',
              })
            : 'Unknown',
          inline: true,
        },
      ],
      footer: { text: deal.store ? `Free on ${deal.store}` : '' },
    }));

    for (let i = 0; i < embeds.length; i += 10) {
      await this.postToWebhook({ embeds: embeds.slice(i, i + 10) });
    }
  }

  private async postToWebhook(body: { embeds: DiscordEmbed[] }): Promise<void> {
    const response = await fetch(this.config.DISCORD_DEALS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} — ${text}`);
    }
    this.logger.debug(`Sent ${body.embeds.length} embed(s) to Discord`);
  }
}
