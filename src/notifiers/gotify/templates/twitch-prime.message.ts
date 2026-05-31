import type { TwitchPrimeItem } from '../../../plugins/twitch-prime/twitch-prime.types';
import type { GotifyMessage } from '../gotify.types';

export function buildTwitchPrimeMessage(
  item: TwitchPrimeItem,
  options: { priority: number },
): GotifyMessage {
  const url = `https://www.twitch.tv/${item.channel}`;
  return {
    title: 'Ton sub Twitch Prime est disponible !',
    message: `Tu peux utiliser ton abonnement Prime sur la chaîne **${item.channel}** ce mois-ci.\n\n[Aller sur la chaîne](${url})`,
    priority: options.priority,
    extras: {
      'client::display': { contentType: 'text/markdown' },
      'client::action': { onReceive: { intentUrl: url } },
    },
  };
}