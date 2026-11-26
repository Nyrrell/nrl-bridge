import type { Deal } from '../../../plugins/deals/deal.types';
import type { TemplateVars } from '../webhook.types';

export const DEALS_VARIABLES = [
  'id',
  'plugin',
  'title',
  'description',
  'url',
  'store',
  'originalPrice',
  'thumbnailUrl',
  'endDate',
  'endDateTs',
] as const;

export function dealVars(deal: Deal, options: { locale: string; timezone: string }): TemplateVars {
  const end = deal.endDate ? new Date(deal.endDate) : undefined;
  return {
    id: deal.id,
    plugin: deal.plugin,
    title: deal.title,
    description: deal.description,
    url: deal.url,
    store: deal.store,
    originalPrice: deal.originalPrice || 'Inconnu',
    thumbnailUrl: deal.thumbnailUrl,
    endDate: end
      ? end.toLocaleDateString(options.locale, { dateStyle: 'medium', timeZone: options.timezone })
      : 'Inconnu',
    endDateTs: end ? Math.floor(end.getTime() / 1000) : undefined,
  };
}
