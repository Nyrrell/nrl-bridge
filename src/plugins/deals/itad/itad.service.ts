import { Injectable, Inject, Logger } from '@nestjs/common';

import { SeenItemsService } from '../../../core/database/seen-items.service';
import type { Notifier } from '../../../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../../../core/notifiers.token';
import { ItadDbService } from './itad-db.service';
import { processDeals } from '../process-deals';
import { ItadSource } from './itad.source';

@Injectable()
export class ItadService {
  private readonly logger = new Logger(ItadService.name);

  constructor(
    private readonly seenItems: SeenItemsService,
    private readonly source: ItadSource,
    private readonly db: ItadDbService,
    @Inject(NOTIFIERS_TOKEN) private readonly notifiers: Notifier[],
  ) {}

  async processDeals(): Promise<void> {
    await processDeals(this.source, this.db, this.notifiers, this.seenItems, this.logger);
  }
}
