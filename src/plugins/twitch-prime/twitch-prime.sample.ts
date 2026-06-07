import type { TestSample } from '../../notifiers/test/test-sample.token';
import type { TwitchPrimeItem } from './twitch-prime.types';

const sampleItem: TwitchPrimeItem = {
  id: 'twitch-prime:test:sample',
  source: 'twitch-prime',
  channel: 'test_channel',
};

export const twitchPrimeSample: TestSample = {
  source: 'twitch-prime',
  items: [sampleItem],
};