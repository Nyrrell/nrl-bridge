import type { Deal } from '../../../plugins/deals/deal.types';
import { buildDealsMessage } from './deals.message';

const baseDeal: Deal = {
  id: 'epic:epic:abc',
  source: 'deals',
  plugin: 'epic',
  title: 'Some Game',
  store: 'Epic Games Store',
  description: 'A great game.',
  thumbnailUrl: 'https://example.org/thumb.png',
  url: 'https://example.org/deal',
  originalPrice: '19,99 €',
  endDate: '2026-12-03T16:00:00.000Z',
};

const options = {
  locale: 'fr-FR',
  timezone: 'Europe/Paris',
  priority: 'normal' as const,
  sender: 'nrl-bridge',
};

describe('buildDealsMessage', () => {
  it('maps a deal to a webhook message', () => {
    const message = buildDealsMessage(baseDeal, options);
    expect(message).toMatchObject({
      title: 'Some Game',
      content: 'A great game.',
      priority: 'normal',
      tone: 'success',
      sender: 'nrl-bridge',
      click_url: 'https://example.org/deal',
      dedupe_key: 'epic:epic:abc',
    });
    const embed = message.embeds?.[0];
    expect(embed?.thumbnail).toEqual({ url: 'https://example.org/thumb.png' });
    expect(embed?.footer).toEqual({ text: 'Gratuit sur Epic Games Store' });
    expect(embed?.fields?.[1].value).toBe('3 déc. 2026');
  });

  it('drops the footer and thumbnail when missing', () => {
    const message = buildDealsMessage(
      { ...baseDeal, store: undefined, thumbnailUrl: '', endDate: null },
      options,
    );
    const embed = JSON.parse(JSON.stringify(message.embeds?.[0]));
    expect(embed.footer).toBeUndefined();
    expect(embed.thumbnail).toBeUndefined();
    expect(embed.fields[1].value).toBe('Inconnu');
  });

  it('truncates long descriptions', () => {
    const message = buildDealsMessage({ ...baseDeal, description: 'x'.repeat(300) }, options);
    expect(message.content).toBe('x'.repeat(200) + '…');
  });
});
