import type { Item } from '../../core/interfaces/item.interface';

export interface Deal extends Item {
  source: 'deals';
  title: string;
  store?: string;
  description: string;
  thumbnailUrl: string;
  url: string;
  originalPrice: string;
  endDate: string | null;
}
