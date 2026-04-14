import type { Item } from './item.interface';

export interface Source<T extends Item = Item> {
  fetch(): Promise<T[]>;
}
