import { z } from 'zod';

import { TWITCH_PRIME_VARIABLES } from './templates/twitch-prime.template';
import { DEALS_VARIABLES } from './templates/deals.template';
import { loadTemplateFile } from './webhook-template';
import type { JsonValue } from './webhook.types';

const DEFAULT_AUTH_HEADER = 'Authorization: Bearer {{token}}';

// URL of the endpoint; {{token}} may appear in it (e.g. ?token={{token}}).
const UrlSchema = z
  .string()
  .refine((u) => z.url().safeParse(u.replace(/\{\{\s*token\s*\}\}/g, 'x')).success, {
    message: 'Invalid URL',
  });

// "Name: value" header, {{token}} allowed in the value. Empty disables it.
const AuthHeaderSchema = z
  .string()
  .default(DEFAULT_AUTH_HEADER)
  .transform((raw, ctx) => {
    if (raw.trim() === '') return undefined;
    const sep = raw.indexOf(':');
    const name = sep > 0 ? raw.slice(0, sep).trim() : '';
    if (!/^[A-Za-z0-9-]+$/.test(name)) {
      ctx.addIssue({ code: 'custom', message: 'Expected "Header-Name: value"' });
      return z.NEVER;
    }
    return { name, value: raw.slice(sep + 1).trim() };
  });

// Path to the JSON template of a source. Required: the receiver's format
// cannot be guessed, so there is no built-in body.
function templateSchema(allowed: readonly string[]) {
  return z
    .string({ error: 'required, path to a JSON template (see examples/webhook/)' })
    .min(1, { error: 'required, path to a JSON template (see examples/webhook/)' })
    .transform((path, ctx): JsonValue => {
      try {
        return loadTemplateFile(path, allowed);
      } catch (error) {
        ctx.addIssue({ code: 'custom', message: (error as Error).message });
        return z.NEVER;
      }
    });
}

export const WebhookDealsConfigSchema = z
  .object({
    WEBHOOK_URL: UrlSchema,
    WEBHOOK_AUTH_HEADER: AuthHeaderSchema,
    WEBHOOK_EPIC_TOKEN: z.string().min(1).optional(),
    WEBHOOK_ITAD_TOKEN: z.string().min(1).optional(),
    WEBHOOK_PRIME_TOKEN: z.string().min(1).optional(),
    WEBHOOK_DEALS_TEMPLATE: templateSchema(DEALS_VARIABLES),
  })
  .refine((c) => Boolean(c.WEBHOOK_EPIC_TOKEN || c.WEBHOOK_ITAD_TOKEN || c.WEBHOOK_PRIME_TOKEN), {
    message:
      'At least one of WEBHOOK_EPIC_TOKEN, WEBHOOK_ITAD_TOKEN, WEBHOOK_PRIME_TOKEN must be set',
  });

export type WebhookDealsConfig = z.infer<typeof WebhookDealsConfigSchema>;

export const WEBHOOK_DEALS_CONFIG = Symbol('WEBHOOK_DEALS_CONFIG');

export const WebhookTwitchPrimeConfigSchema = z.object({
  WEBHOOK_URL: UrlSchema,
  WEBHOOK_AUTH_HEADER: AuthHeaderSchema,
  WEBHOOK_TWITCH_PRIME_TOKEN: z.string().min(1),
  WEBHOOK_TWITCH_PRIME_TEMPLATE: templateSchema(TWITCH_PRIME_VARIABLES),
});

export type WebhookTwitchPrimeConfig = z.infer<typeof WebhookTwitchPrimeConfigSchema>;

export const WEBHOOK_TWITCH_PRIME_CONFIG = Symbol('WEBHOOK_TWITCH_PRIME_CONFIG');
