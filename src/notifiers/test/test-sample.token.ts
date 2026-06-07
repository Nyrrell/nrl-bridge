import type { Item } from '../../core/interfaces/item.interface';

// A test sample is a set of example items for a given source, used by the
// test endpoint to exercise every notifier that handles that source.
export interface TestSample {
  source: string;
  items: Item[];
}

export const TEST_SAMPLES_TOKEN = Symbol('TEST_SAMPLES');