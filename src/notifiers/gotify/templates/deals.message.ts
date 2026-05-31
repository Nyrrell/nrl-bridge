import type { Deal } from '../../../plugins/deals/deal.types';
import type { GotifyMessage } from '../gotify.types';

export function buildDealsMessage(
  deal: Deal,
  options: { locale: string; timezone: string; priority: number },
): GotifyMessage {
  const description =
    deal.description.length > 200 ? deal.description.slice(0, 200) + '…' : deal.description;
  const endDate = deal.endDate
    ? new Date(deal.endDate).toLocaleDateString(options.locale, {
        dateStyle: 'medium',
        timeZone: options.timezone,
      })
    : 'Inconnu';

  const storeAlreadyInDescription =
    deal.store !== undefined &&
    description.toLowerCase().includes(`gratuit sur ${deal.store.toLowerCase()}`);

  const lines = [
    deal.thumbnailUrl ? `![](${deal.thumbnailUrl})\n` : null,
    deal.store && !storeAlreadyInDescription ? `**Gratuit sur ${deal.store}**` : null,
    description,
    '',
    `**Prix original** : ${deal.originalPrice}\n`,
    `**Gratuit jusqu'au** : ${endDate}`,
    '',
    `[Voir l'offre](${deal.url})`,
  ].filter((l): l is string => l !== null);

  const extras: Record<string, unknown> = {
    'client::display': { contentType: 'text/markdown' },
    'client::action': { onReceive: { intentUrl: deal.url } },
  };
  if (deal.thumbnailUrl) {
    extras['client::notification'] = { bigImageUrl: deal.thumbnailUrl };
  }

  return {
    title: deal.title,
    message: lines.join('\n'),
    priority: options.priority,
    extras,
  };
}