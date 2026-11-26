import type { TwitchPrimeItem } from '../../../plugins/twitch-prime/twitch-prime.types';
import type { WebhookMessage, WebhookPriority } from '../webhook.types';

export function buildTwitchPrimeMessage(
  item: TwitchPrimeItem,
  options: { priority: WebhookPriority; sender: string },
): WebhookMessage {
  return {
    title: 'Ton sub Twitch Prime est disponible !',
    content: `Tu peux utiliser ton abonnement Prime sur la chaîne **${item.channel}** ce mois-ci.`,
    priority: options.priority,
    tone: 'info',
    sender: options.sender,
    click_url: `https://www.twitch.tv/${item.channel}`,
    dedupe_key: item.id,
  };
}
