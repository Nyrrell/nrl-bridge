import { Injectable, Logger, Inject } from '@nestjs/common';

import { MAIL_DEALS_CONFIG, type MailDealsConfig } from './mail.config';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import type { Item } from '../../core/interfaces/item.interface';
import { APP_CONFIG, type AppConfig } from '../../core/config';
import { buildDealsEmail } from './templates/deals.email';
import type { Deal } from '../../plugins/deals/deal.types';
import { sendMail } from './mail-client';

@Injectable()
export class MailDealsNotifier implements Notifier<Deal> {
  private readonly logger = new Logger(MailDealsNotifier.name);

  constructor(
    @Inject(MAIL_DEALS_CONFIG) private readonly config: MailDealsConfig,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'deals';
  }

  async send(items: Item[]): Promise<void> {
    const deals = items as Deal[];
    if (deals.length === 0) return;

    const to = this.config.MAIL_DEALS_TO ?? this.config.MAIL_TO;
    if (!to) return;

    for (const deal of deals) {
      const message = buildDealsEmail(deal, {
        locale: this.appConfig.LOCALE,
        timezone: this.appConfig.TIMEZONE,
      });
      await sendMail(this.config, to, message);
    }
    this.logger.debug(`Sent ${deals.length} deal email(s)`);
  }
}