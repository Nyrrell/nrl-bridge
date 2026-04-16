import type { Deal } from '../../../plugins/deals/deal.types';
import type { DiscordEmbed } from '../discord.types';

export function buildDealsEmbeds(
  deals: Deal[],
  options: { locale: string; timezone: string },
): DiscordEmbed[] {
  return deals.map((deal) => ({
    title: deal.title,
    description:
      deal.description.length > 200 ? deal.description.slice(0, 200) + '…' : deal.description,
    url: deal.url,
    color: 0x2ecc71,
    thumbnail: deal.thumbnailUrl ? { url: deal.thumbnailUrl } : undefined,
    fields: [
      { name: 'Prix original', value: deal.originalPrice, inline: true },
      {
        name: "Gratuit jusqu'au",
        value: deal.endDate
          ? new Date(deal.endDate).toLocaleDateString(options.locale, {
              dateStyle: 'medium',
              timeZone: options.timezone,
            })
          : 'Inconnu',
        inline: true,
      },
    ],
    footer: { text: deal.store ? `Gratuit sur ${deal.store}` : '' },
  }));
}
