import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../../core/database/database.service';
import type { ItadPluginDb } from './itad.types';
import type { Deal } from '../deal.types';

@Injectable()
export class ItadDbService {
  private readonly pluginDb: ItadPluginDb;

  constructor(private readonly dbService: DatabaseService) {
    this.pluginDb = dbService.db as unknown as ItadPluginDb;
  }

  async insertDeals(deals: Deal[]): Promise<void> {
    if (deals.length === 0) return;
    await this.pluginDb
      .insertInto('itad_deals')
      .values(
        deals.map((d) => {
          const [, , shopId, gameSlug] = d.id.split(':');
          return {
            id: d.id,
            source: d.source,
            game_slug: gameSlug,
            shop_id: shopId,
            shop_name: d.store ?? '',
            title: d.title,
            url: d.url,
            original_price: d.originalPrice,
            end_date: d.endDate,
            seen_at: new Date().toISOString(),
          };
        }),
      )
      .onConflict((oc) => oc.column('id').doNothing())
      .execute();
  }
}
