import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { assertKnownPlaceholders, loadTemplateFile, renderTemplate } from './webhook-template';
import { TWITCH_PRIME_VARIABLES } from './templates/twitch-prime.template';
import { DEALS_VARIABLES, dealVars } from './templates/deals.template';
import type { Deal } from '../../plugins/deals/deal.types';

describe('renderTemplate', () => {
  it('fills placeholders inside strings', () => {
    expect(renderTemplate({ t: 'Hello {{name}} !' }, { name: 'Bob' })).toEqual({
      t: 'Hello Bob !',
    });
  });

  it('cannot break the JSON with quotes or newlines', () => {
    const body = renderTemplate({ t: '{{v}} x' }, { v: '"a"\n}' });
    expect(JSON.parse(JSON.stringify(body))).toEqual({ t: '"a"\n} x' });
  });

  it('keeps the type of a lone placeholder', () => {
    expect(renderTemplate({ ts: '{{ts}}' }, { ts: 42 })).toEqual({ ts: 42 });
  });

  it('drops empty keys and the containers they empty', () => {
    const template = { a: '{{x}}', thumb: { url: '{{x}}' }, list: ['{{x}}'], keep: 'k', empty: {} };
    expect(renderTemplate(template, { x: '' })).toEqual({ keep: 'k', empty: {} });
  });

  it('leaves literal values untouched', () => {
    expect(renderTemplate({ n: 1, b: true, z: null }, {})).toEqual({ n: 1, b: true, z: null });
  });
});

describe('template loading', () => {
  it('rejects unknown variables', () => {
    expect(() => assertKnownPlaceholders({ t: '{{nope}}' }, ['title'])).toThrow('{{nope}}');
  });

  it('reads a JSON file and reports invalid JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'tpl-'));
    writeFileSync(join(dir, 'ok.json'), '{"t": "{{title}}"}');
    writeFileSync(join(dir, 'bad.json'), '{"t": ');
    expect(loadTemplateFile(join(dir, 'ok.json'), DEALS_VARIABLES)).toEqual({ t: '{{title}}' });
    expect(() => loadTemplateFile(join(dir, 'bad.json'), DEALS_VARIABLES)).toThrow('bad.json');
  });
});

const EXAMPLES = join(__dirname, '../../../examples/webhook');

describe('example templates', () => {
  it.each([
    ['deals.json', DEALS_VARIABLES],
    ['deals.minimal.json', DEALS_VARIABLES],
    ['twitch-prime.json', TWITCH_PRIME_VARIABLES],
  ])('%s is valid and uses known variables', (file, vars) => {
    expect(() => loadTemplateFile(join(EXAMPLES, file), vars)).not.toThrow();
  });
});

describe('example deals template', () => {
  const deal: Deal = {
    id: 'epic:epic:abc',
    source: 'deals',
    plugin: 'epic',
    title: 'Some Game',
    description: 'A great game.',
    thumbnailUrl: '',
    url: 'https://example.org/deal',
    originalPrice: '19,99 €',
    endDate: '2026-12-03T16:00:00.000Z',
  };

  it('renders a deal without store nor thumbnail', () => {
    const body = renderTemplate(
      loadTemplateFile(join(EXAMPLES, 'deals.json'), DEALS_VARIABLES),
      dealVars(deal, { locale: 'fr-FR', timezone: 'Europe/Paris' }),
    ) as Record<string, unknown>;
    expect(body.content).toBe("Gratuit jusqu'au 3 déc. 2026 (19,99 €)\nA great game.");
    expect(body.dedupe_key).toBe('epic:epic:abc');
    const embed = (body.embeds as Record<string, unknown>[])[0];
    expect(embed.thumbnail).toBeUndefined();
    expect(embed.footer).toBeUndefined();
  });
});
