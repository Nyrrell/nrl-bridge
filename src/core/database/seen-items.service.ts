import { Injectable } from '@nestjs/common';

import type { Item } from '../interfaces/item.interface';
import { DatabaseService } from './database.service';

@Injectable()
export class SeenItemsService {
  constructor(private readonly dbService: DatabaseService) {}

  async filterNew<T extends Item>(items: T[]): Promise<T[]> {
    if (items.length === 0) return [];
    const ids = items.map((i) => i.id);
    const seen = await this.dbService.db
      .selectFrom('seen_items')
      .select('id')
      .where('id', 'in', ids)
      .execute();
    const seenSet = new Set(seen.map((r) => r.id));
    return items.filter((i) => !seenSet.has(i.id));
  }

  async markSeen(items: Item[]): Promise<void> {
    if (items.length === 0) return;
    await this.dbService.db
      .insertInto('seen_items')
      .values(
        items.map((i) => ({
          id: i.id,
          source: i.source,
          seen_at: new Date().toISOString(),
        })),
      )
      .onConflict((oc) => oc.column('id').doNothing())
      .execute();
  }
}
