import { Injectable, Inject, Logger } from '@nestjs/common';

import { SeenItemsService } from '../../../core/database/seen-items.service';
import type { Notifier } from '../../../core/interfaces/notifier.interface';
import { NOTIFIERS_TOKEN } from '../../../core/notifiers.token';
import { EpicDbService } from './epic-db.service';
import { processDeals } from '../process-deals';
import { EpicSource } from './epic.source';

@Injectable()
export class EpicService {
  private readonly logger = new Logger(EpicService.name);

  constructor(
    private readonly seenItems: SeenItemsService,
    private readonly source: EpicSource,
    private readonly db: EpicDbService,
    @Inject(NOTIFIERS_TOKEN) private readonly notifiers: Notifier[],
  ) {}

  async processDeals(): Promise<void> {
    await processDeals(this.source, this.db, this.notifiers, this.seenItems, this.logger);
  }
}
