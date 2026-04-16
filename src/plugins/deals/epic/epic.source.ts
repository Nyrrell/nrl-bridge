import { Injectable, Inject } from '@nestjs/common';

import { APP_CONFIG, type AppConfig } from '../../../core/config';
import type { Source } from '../../../core/interfaces/source.interface';
import type { EpicGame } from './epic.types';
import type { Deal } from '../deal.types';

const EPIC_API_BASE = 'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions';

@Injectable()
export class EpicSource implements Source<Deal> {
  constructor(@Inject(APP_CONFIG) private readonly appConfig: AppConfig) {}

  async fetch(): Promise<Deal[]> {
    const url = new URL(EPIC_API_BASE);
    url.searchParams.set('locale', this.appConfig.LOCALE);
    url.searchParams.set('country', this.appConfig.COUNTRY);
    url.searchParams.set('allowCountries', this.appConfig.COUNTRY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Epic API responded with ${response.status}`);
    }
    const json = (await response.json()) as {
      data: { Catalog: { searchStore: { elements: EpicGame[] } } };
    };
    const elements = json?.data?.Catalog?.searchStore?.elements ?? [];
    return elements.filter((game) => this.isFreeNow(game)).map((game) => this.mapToDeal(game));
  }

  private isFreeNow(game: EpicGame): boolean {
    const offers = game.promotions?.promotionalOffers?.[0]?.promotionalOffers ?? [];
    return offers.some(
      (o) =>
        o.discountSetting.discountType === 'PERCENTAGE' &&
        o.discountSetting.discountPercentage === 0,
    );
  }

  private mapToDeal(game: EpicGame): Deal {
    const slug =
      game.catalogNs?.mappings?.find((m) => m.pageType === 'productHome')?.pageSlug ??
      game.offerMappings?.find((m) => m.pageType === 'productHome')?.pageSlug ??
      game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const thumbnail =
      game.keyImages.find((img) => img.type === 'OfferImageWide')?.url ??
      game.keyImages.find((img) => img.type === 'Thumbnail')?.url ??
      '';

    const endDate =
      game.promotions?.promotionalOffers?.[0]?.promotionalOffers?.[0]?.endDate ?? null;

    return {
      id: `deals:epic:${slug}`,
      source: 'deals',
      plugin: 'epic',
      title: game.title,
      description: game.description,
      thumbnailUrl: thumbnail,
      url: `https://store.epicgames.com/${this.appConfig.LOCALE}/p/${slug}`,
      originalPrice: game.price.totalPrice.fmtPrice.originalPrice,
      endDate,
    };
  }
}
