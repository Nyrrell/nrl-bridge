import { Injectable, Logger, Inject } from '@nestjs/common';

import { WEBHOOK_DEALS_CONFIG, type WebhookDealsConfig } from './webhook.config';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import type { Item } from '../../core/interfaces/item.interface';
import { APP_CONFIG, type AppConfig } from '../../core/config';
import { buildDealsMessage } from './templates/deals.message';
import type { Deal } from '../../plugins/deals/deal.types';
import { postMessage } from './webhook-client';

@Injectable()
export class WebhookDealsNotifier implements Notifier<Deal> {
  private readonly logger = new Logger(WebhookDealsNotifier.name);

  constructor(
    @Inject(WEBHOOK_DEALS_CONFIG) private readonly config: WebhookDealsConfig,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'deals';
  }

  async send(items: Item[]): Promise<void> {
    const deals = items as Deal[];
    if (deals.length === 0) return;

    const tokenByPlugin: Record<string, string | undefined> = {
      epic: this.config.WEBHOOK_EPIC_TOKEN,
      itad: this.config.WEBHOOK_ITAD_TOKEN,
      prime: this.config.WEBHOOK_PRIME_TOKEN,
    };

    const plugin = deals[0].plugin;
    const token = tokenByPlugin[plugin];
    if (!token) {
      this.logger.warn(
        `No webhook token configured for plugin "${plugin}", skipping ${deals.length} deal(s)`,
      );
      return;
    }

    for (const deal of deals) {
      const message = buildDealsMessage(deal, {
        locale: this.appConfig.LOCALE,
        timezone: this.appConfig.TIMEZONE,
        priority: this.config.WEBHOOK_DEALS_PRIORITY,
        sender: this.config.WEBHOOK_SENDER,
      });
      await postMessage(this.config.WEBHOOK_URL, token, message);
    }
    this.logger.debug(`Sent ${deals.length} message(s) to webhook (plugin: ${plugin})`);
  }
}
