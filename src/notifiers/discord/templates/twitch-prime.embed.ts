import type { TwitchPrimeItem } from '../../../plugins/twitch-prime/twitch-prime.types';
import type { DiscordEmbed } from '../discord.types';

export function buildTwitchPrimeEmbed(item: TwitchPrimeItem): DiscordEmbed {
  return {
    title: 'Ton sub Twitch Prime est disponible !',
    description: `Tu peux utiliser ton abonnement Prime sur la chaîne **${item.channel}** ce mois-ci.`,
    url: `https://www.twitch.tv/${item.channel}`,
    color: 0x9146ff,
    footer: { text: item.id },
  };
}
