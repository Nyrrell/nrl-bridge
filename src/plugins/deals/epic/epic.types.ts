import type { Kysely } from 'kysely';

// Epic API response types

export interface EpicPromotionalOffer {
  startDate: string;
  endDate: string;
  discountSetting: {
    discountType: string;
    discountPercentage: number;
  };
}

export interface EpicGame {
  title: string;
  description: string;
  price: {
    totalPrice: {
      fmtPrice: { originalPrice: string };
    };
  };
  promotions: {
    promotionalOffers: Array<{
      promotionalOffers: EpicPromotionalOffer[];
    }>;
  } | null;
  keyImages: Array<{ type: string; url: string }>;
  catalogNs?: { mappings?: Array<{ pageSlug: string; pageType: string }> };
  offerMappings?: Array<{ pageSlug: string; pageType: string }>;
}

// Database table types

export interface EpicDealsTable {
  id: string;
  source: string;
  title: string;
  url: string;
  original_price: string;
  thumbnail_url: string;
  end_date: string | null;
  seen_at: string;
}

export type EpicPluginDb = Kysely<{ epic_deals: EpicDealsTable }>;
