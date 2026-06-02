import type { TwitchPrimeItem } from '../../../plugins/twitch-prime/twitch-prime.types';
import type { MailMessage } from '../mail.types';

export function buildTwitchPrimeEmail(item: TwitchPrimeItem): MailMessage {
  const url = `https://www.twitch.tv/${item.channel}`;
  return {
    subject: 'Ton sub Twitch Prime est disponible !',
    html: [
      `<p>Tu peux utiliser ton abonnement Prime sur la chaîne <strong>${item.channel}</strong> ce mois-ci.</p>`,
      `<p><a href="${url}">Aller sur la chaîne</a></p>`,
    ].join('\n'),
    text: [
      `Tu peux utiliser ton abonnement Prime sur la chaîne ${item.channel} ce mois-ci.`,
      '',
      `Aller sur la chaîne : ${url}`,
    ].join('\n'),
  };
}