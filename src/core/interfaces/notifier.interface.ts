import type { Item } from './item.interface';

export interface Notifier<T extends Item = Item> {
  canHandle(source: string): boolean;
  send(items: T[]): Promise<void>;
}
