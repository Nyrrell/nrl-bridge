import { Injectable, Inject } from '@nestjs/common';

import type { Source } from '../../../core/interfaces/source.interface';
import { ITAD_CONFIG, type ItadConfig } from './itad.config';
import type { ItadDealItem, ItadDealsResponse } from './itad.types';
import type { Deal } from '../deal.types';

const ITAD_DEALS_URL = 'https://api.isthereanydeal.com/deals/v2';

@Injectable()
export class ItadSource implements Source<Deal> {
  constructor(@Inject(ITAD_CONFIG) private readonly config: ItadConfig) {}

  async fetch(): Promise<Deal[]> {
    const deals: Deal[] = [];
    let offset = 0;
    const limit = 100;

    do {
      const url = new URL(ITAD_DEALS_URL);
      url.searchParams.set('key', this.config.ITAD_API_KEY);
      url.searchParams.set('country', 'FR');
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('offset', String(offset));
      url.searchParams.set('filter', 'N4IgxgrgLiBcoFsCWA7OBGADJgNCBAhgB4bYC+ZQA==='); // Price cut 100%

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`ITAD deals API responded with ${response.status}`);
      }

      const data = (await response.json()) as ItadDealsResponse;
      const freeBatch = data.list
        .filter((item) => item.deal.shop.id !== 16) // exclude Epic Games
        .filter((item) => item.deal.cut === 100 && item.deal.price.amount === 0)
        .map((item) => this.mapToDeal(item));

      deals.push(...freeBatch);

      if (!data.hasMore) break;
      offset += limit;
    } while (true);

    return deals;
  }

  private mapToDeal(item: ItadDealItem): Deal {
    const originalPrice =
      item.deal.regular.amount > 0
        ? `${item.deal.regular.amount.toFixed(2)} ${item.deal.regular.currency}`
        : 'Free';

    return {
      id: `deals:itad:${item.deal.shop.id}:${item.slug}`,
      source: 'deals',
      title: item.title,
      store: item.deal.shop.name,
      description: `Free on ${item.deal.shop.name}`,
      thumbnailUrl: item.assets.boxart,
      url: item.deal.url,
      originalPrice,
      endDate: item.deal.expiry,
    };
  }
}
