import { Injectable } from '@nestjs/common';

import type { Source } from '../../../core/interfaces/source.interface';
import type { EpicGame } from './epic.types';
import type { Deal } from '../deal.types';

const EPIC_API_URL =
  'https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=US&allowCountries=US';

@Injectable()
export class EpicSource implements Source<Deal> {
  async fetch(): Promise<Deal[]> {
    const response = await fetch(EPIC_API_URL);
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
      url: `https://store.epicgames.com/en-US/p/${slug}`,
      originalPrice: game.price.totalPrice.fmtPrice.originalPrice,
      endDate,
    };
  }
}
