import { Injectable, Logger, Inject } from '@nestjs/common';

import { GOTIFY_DEALS_CONFIG, type GotifyDealsConfig } from './gotify.config';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import type { Item } from '../../core/interfaces/item.interface';
import { APP_CONFIG, type AppConfig } from '../../core/config';
import { buildDealsMessage } from './templates/deals.message';
import type { Deal } from '../../plugins/deals/deal.types';
import { postMessage } from './gotify-client';

@Injectable()
export class GotifyDealsNotifier implements Notifier<Deal> {
  private readonly logger = new Logger(GotifyDealsNotifier.name);

  constructor(
    @Inject(GOTIFY_DEALS_CONFIG) private readonly config: GotifyDealsConfig,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'deals';
  }

  async send(items: Item[]): Promise<void> {
    const deals = items as Deal[];
    if (deals.length === 0) return;

    const tokenByPlugin: Record<string, string | undefined> = {
      epic: this.config.GOTIFY_EPIC_TOKEN,
      itad: this.config.GOTIFY_ITAD_TOKEN,
      prime: this.config.GOTIFY_PRIME_TOKEN,
    };

    const plugin = deals[0].plugin;
    const token = tokenByPlugin[plugin];
    if (!token) {
      this.logger.warn(
        `No Gotify token configured for plugin "${plugin}", skipping ${deals.length} deal(s)`,
      );
      return;
    }

    for (const deal of deals) {
      const message = buildDealsMessage(deal, {
        locale: this.appConfig.LOCALE,
        timezone: this.appConfig.TIMEZONE,
        priority: this.config.GOTIFY_DEALS_PRIORITY,
      });
      await postMessage(this.config.GOTIFY_URL, token, message);
    }
    this.logger.debug(`Sent ${deals.length} message(s) to Gotify (plugin: ${plugin})`);
  }
}