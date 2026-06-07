import type { TestSample } from '../../notifiers/test/test-sample.token';
import type { Deal } from './deal.types';

const sampleDeal: Deal = {
  id: 'deals:test:sample',
  source: 'deals',
  plugin: 'itad',
  title: '[TEST] Jeu offert',
  store: 'Test Store',
  description: 'Notification de test - aucun jeu reel concerne.',
  thumbnailUrl: 'https://placehold.co/460x215/png',
  url: 'https://example.com/test-deal',
  originalPrice: '19.99 EUR',
  endDate: null,
};

export const dealSample: TestSample = {
  source: 'deals',
  items: [sampleDeal],
};