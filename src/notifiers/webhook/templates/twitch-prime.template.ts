import type { TwitchPrimeItem } from '../../../plugins/twitch-prime/twitch-prime.types';
import type { TemplateVars } from '../webhook.types';

export const TWITCH_PRIME_VARIABLES = ['id', 'channel', 'channelUrl'] as const;

export function twitchPrimeVars(item: TwitchPrimeItem): TemplateVars {
  return {
    id: item.id,
    channel: item.channel,
    channelUrl: `https://www.twitch.tv/${item.channel}`,
  };
}
