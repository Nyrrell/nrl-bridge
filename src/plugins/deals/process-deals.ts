import type { Logger } from '@nestjs/common';

import type { SeenItemsService } from '../../core/database/seen-items.service';
import type { Notifier } from '../../core/interfaces/notifier.interface';
import type { Source } from '../../core/interfaces/source.interface';
import type { Deal } from './deal.types';

export interface DealStore {
  insertDeals(deals: Deal[]): Promise<void>;
}

export async function processDeals(
  source: Source<Deal>,
  store: DealStore,
  notifiers: Notifier[],
  seenItems: SeenItemsService,
  logger: Logger,
): Promise<void> {
  const deals = await source.fetch();
  const newDeals = await seenItems.filterNew(deals);
  if (newDeals.length === 0) {
    logger.debug('No new deals.');
    return;
  }
  logger.debug(`Found ${newDeals.length} new deal(s)`);
  for (const notifier of notifiers) {
    if (notifier.canHandle('deals')) {
      await notifier.send(newDeals);
    }
  }
  await store.insertDeals(newDeals);
  await seenItems.markSeen(newDeals);
}
