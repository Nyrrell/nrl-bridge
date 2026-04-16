import { Injectable, Inject } from '@nestjs/common';

import type { Source } from '../../../core/interfaces/source.interface';
import type { ItadDealItem, ItadDealsResponse } from './itad.types';
import { APP_CONFIG, type AppConfig } from '../../../core/config';
import { ITAD_CONFIG, type ItadConfig } from './itad.config';
import type { Deal } from '../deal.types';

const ITAD_DEALS_URL = 'https://api.isthereanydeal.com/deals/v2';

@Injectable()
export class ItadSource implements Source<Deal> {
  constructor(
    @Inject(ITAD_CONFIG) private readonly config: ItadConfig,
    @Inject(APP_CONFIG) private readonly appConfig: AppConfig,
  ) {}

  async fetch(): Promise<Deal[]> {
    const deals: Deal[] = [];
    let offset = 0;
    const limit = 100;

    do {
      const url = new URL(ITAD_DEALS_URL);
      url.searchParams.set('key', this.config.ITAD_API_KEY);
      url.searchParams.set('country', this.appConfig.COUNTRY);
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
      plugin: 'itad',
      title: item.title,
      store: item.deal.shop.name,
      description: `Gratuit sur ${item.deal.shop.name}`,
      thumbnailUrl: item.assets.boxart,
      url: item.deal.url,
      originalPrice,
      endDate: item.deal.expiry,
    };
  }
}
