import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../core/database/database.service';
import type { EpicPluginDb } from './epic.types';
import type { Deal } from '../deal.types';

@Injectable()
export class EpicDbService {
  private readonly pluginDb: EpicPluginDb;

  constructor(private readonly dbService: DatabaseService) {
    this.pluginDb = dbService.db as unknown as EpicPluginDb;
  }

  async insertDeals(deals: Deal[]): Promise<void> {
    if (deals.length === 0) return;
    await this.pluginDb
      .insertInto('epic_deals')
      .values(
        deals.map((d) => ({
          id: d.id,
          source: d.source,
          title: d.title,
          url: d.url,
          original_price: d.originalPrice,
          thumbnail_url: d.thumbnailUrl,
          end_date: d.endDate,
          seen_at: new Date().toISOString(),
        })),
      )
      .onConflict((oc) => oc.column('id').doNothing())
      .execute();
  }
}
