import { Injectable, Inject, Logger } from '@nestjs/common';

import { SeenItemsService } from '../../core/database/seen-items.service';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../../core/notifiers.token';
import { TwitchPrimeSource } from './twitch-prime.source';

@Injectable()
export class TwitchPrimeService {
  private readonly logger = new Logger(TwitchPrimeService.name);

  constructor(
    private readonly source: TwitchPrimeSource,
    private readonly seenItems: SeenItemsService,
    @Inject(NOTIFIERS_TOKEN) private readonly notifiers: Notifier[],
  ) {}

  async check(): Promise<void> {
    const items = await this.source.fetch();
    if (items.length === 0) return;

    const newItems = await this.seenItems.filterNew(items);
    if (newItems.length === 0) {
      this.logger.debug('Prime sub already notified this period');
      return;
    }

    const handlers = this.notifiers.filter((n) => n.canHandle('twitch-prime'));
    for (const notifier of handlers) {
      await notifier.send(newItems);
    }

    await this.seenItems.markSeen(newItems);
    this.logger.log(`Notified: Twitch Prime sub available (${newItems[0]?.id})`);
  }
}
