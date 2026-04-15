import { Injectable, Inject, Logger } from '@nestjs/common';

import { SeenItemsService } from '../../../core/database/seen-items.service';
import type { Notifier } from '../../../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../../../core/notifiers.token';
import { PrimeDbService } from './prime-db.service';
import { processDeals } from '../process-deals';
import { PrimeSource } from './prime.source';

@Injectable()
export class PrimeService {
  private readonly logger = new Logger(PrimeService.name);

  constructor(
    private readonly seenItems: SeenItemsService,
    private readonly source: PrimeSource,
    private readonly db: PrimeDbService,
    @Inject(NOTIFIERS_TOKEN) private readonly notifiers: Notifier[],
  ) {}

  async processDeals(): Promise<void> {
    await processDeals(this.source, this.db, this.notifiers, this.seenItems, this.logger);
  }
}
