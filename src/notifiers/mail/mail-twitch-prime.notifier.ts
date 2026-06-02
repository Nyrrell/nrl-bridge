import { Injectable, Logger, Inject } from '@nestjs/common';

import { MAIL_TWITCH_PRIME_CONFIG, type MailTwitchPrimeConfig } from './mail.config';
import type { TwitchPrimeItem } from '../../plugins/twitch-prime/twitch-prime.types';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { buildTwitchPrimeEmail } from './templates/twitch-prime.email';
import type { Item } from '../../core/interfaces/item.interface';
import { sendMail } from './mail-client';

@Injectable()
export class MailTwitchPrimeNotifier implements Notifier<TwitchPrimeItem> {
  private readonly logger = new Logger(MailTwitchPrimeNotifier.name);

  constructor(
    @Inject(MAIL_TWITCH_PRIME_CONFIG) private readonly config: MailTwitchPrimeConfig,
  ) {}

  canHandle(source: string): boolean {
    return source === 'twitch-prime';
  }

  async send(items: Item[]): Promise<void> {
    const primeItems = items as TwitchPrimeItem[];
    if (primeItems.length === 0) return;

    const to = this.config.MAIL_TWITCH_PRIME_TO ?? this.config.MAIL_TO;
    if (!to) return;

    for (const item of primeItems) {
      const message = buildTwitchPrimeEmail(item);
      await sendMail(this.config, to, message);
    }
    this.logger.debug(`Sent ${primeItems.length} Twitch Prime email(s)`);
  }
}