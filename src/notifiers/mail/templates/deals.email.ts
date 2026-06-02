import type { Deal } from '../../../plugins/deals/deal.types';
import type { MailMessage } from '../mail.types';

export function buildDealsEmail(
  deal: Deal,
  options: { locale: string; timezone: string },
): MailMessage {
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
  const storeLine =
    deal.store && !storeAlreadyInDescription ? `Gratuit sur ${deal.store}` : null;

  const textLines = [
    storeLine,
    description,
    '',
    `Prix original : ${deal.originalPrice}`,
    `Gratuit jusqu'au : ${endDate}`,
    '',
    `Voir l'offre : ${deal.url}`,
  ].filter((l): l is string => l !== null);

  const htmlParts = [
    deal.thumbnailUrl
      ? `<img src="${deal.thumbnailUrl}" alt="" style="max-width:100%;border-radius:8px" />`
      : null,
    storeLine ? `<p><strong>${storeLine}</strong></p>` : null,
    `<p>${escapeHtml(description)}</p>`,
    `<p><strong>Prix original</strong> : ${escapeHtml(deal.originalPrice)}<br />`,
    `<strong>Gratuit jusqu'au</strong> : ${escapeHtml(endDate)}</p>`,
    `<p><a href="${deal.url}">Voir l'offre</a></p>`,
  ].filter((l): l is string => l !== null);

  return {
    subject: deal.title,
    html: htmlParts.join('\n'),
    text: textLines.join('\n'),
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}