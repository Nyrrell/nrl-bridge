import type { Kysely } from 'kysely';

// ITAD API response types

export interface ItadDealItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  assets: {
    boxart: string;
  };
  deal: {
    shop: { id: number; name: string };
    regular: { amount: number; currency: string };
    price: { amount: number; currency: string };
    cut: number;
    expiry: string | null;
    url: string;
  };
}

export interface ItadDealsResponse {
  list: ItadDealItem[];
  hasMore: boolean;
}

// Database table types

export interface ItadDealsTable {
  id: string;
  source: string;
  game_slug: string;
  shop_id: string;
  shop_name: string;
  title: string;
  url: string;
  original_price: string;
  end_date: string | null;
  seen_at: string;
}

export type ItadPluginDb = Kysely<{ itad_deals: ItadDealsTable }>;
