import type { Kysely } from 'kysely';

// Luna GraphQL API response types

export interface LunaDefaultMedia {
  src1x: string;
  src2x: string;
  type: string;
}

export interface LunaAssets {
  id: string;
  title: string;
  externalClaimLink: string;
  shortformDescription: string;
  cardMedia: {
    defaultMedia: LunaDefaultMedia;
  };
}

export interface LunaOffer {
  id: string;
  startTime: string;
  endTime: string;
}

export interface LunaItem {
  id: string;
  isFGWP: boolean;
  assets: LunaAssets;
  offers: LunaOffer[];
}

export interface LunaGamesResponse {
  data: {
    games: {
      items: LunaItem[];
    };
  };
}

// Database table types

export interface PrimeDealsTable {
  id: string;
  source: string;
  title: string;
  url: string;
  original_price: string;
  thumbnail_url: string;
  end_date: string | null;
  seen_at: string;
}

export type PrimePluginDb = Kysely<{ prime_deals: PrimeDealsTable }>;
