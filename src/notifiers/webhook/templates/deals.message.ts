import type { WebhookMessage, WebhookPriority } from '../webhook.types';
import type { Deal } from '../../../plugins/deals/deal.types';

export function buildDealsMessage(
  deal: Deal,
  options: { locale: string; timezone: string; priority: WebhookPriority; sender: string },
): WebhookMessage {
  const description =
    deal.description.length > 200 ? deal.description.slice(0, 200) + '…' : deal.description;
  const endDate = deal.endDate
    ? new Date(deal.endDate).toLocaleDateString(options.locale, {
        dateStyle: 'medium',
        timeZone: options.timezone,
      })
    : 'Inconnu';

  return {
    title: deal.title,
    content: description || undefined,
    priority: options.priority,
    tone: 'success',
    sender: options.sender,
    click_url: deal.url,
    dedupe_key: deal.id,
    embeds: [
      {
        color: 0x2ecc71,
        thumbnail: deal.thumbnailUrl ? { url: deal.thumbnailUrl } : undefined,
        fields: [
          { name: 'Prix original', value: deal.originalPrice || 'Inconnu', inline: true },
          { name: "Gratuit jusqu'au", value: endDate, inline: true },
        ],
        footer: deal.store ? { text: `Gratuit sur ${deal.store}` } : undefined,
      },
    ],
  };
}
