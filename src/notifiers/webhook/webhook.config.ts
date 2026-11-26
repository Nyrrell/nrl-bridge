import { z } from 'zod';

const PrioritySchema = z.enum(['silent', 'normal', 'urgent']).default('normal');

export const WebhookDealsConfigSchema = z
  .object({
    WEBHOOK_URL: z.url(),
    WEBHOOK_SENDER: z.string().min(1).default('nrl-bridge'),
    WEBHOOK_EPIC_TOKEN: z.string().min(1).optional(),
    WEBHOOK_ITAD_TOKEN: z.string().min(1).optional(),
    WEBHOOK_PRIME_TOKEN: z.string().min(1).optional(),
    WEBHOOK_DEALS_PRIORITY: PrioritySchema,
  })
  .refine((c) => Boolean(c.WEBHOOK_EPIC_TOKEN || c.WEBHOOK_ITAD_TOKEN || c.WEBHOOK_PRIME_TOKEN), {
    message:
      'At least one of WEBHOOK_EPIC_TOKEN, WEBHOOK_ITAD_TOKEN, WEBHOOK_PRIME_TOKEN must be set',
  });

export type WebhookDealsConfig = z.infer<typeof WebhookDealsConfigSchema>;

export const WEBHOOK_DEALS_CONFIG = Symbol('WEBHOOK_DEALS_CONFIG');

export const WebhookTwitchPrimeConfigSchema = z.object({
  WEBHOOK_URL: z.url(),
  WEBHOOK_SENDER: z.string().min(1).default('nrl-bridge'),
  WEBHOOK_TWITCH_PRIME_TOKEN: z.string().min(1),
  WEBHOOK_TWITCH_PRIME_PRIORITY: PrioritySchema,
});

export type WebhookTwitchPrimeConfig = z.infer<typeof WebhookTwitchPrimeConfigSchema>;

export const WEBHOOK_TWITCH_PRIME_CONFIG = Symbol('WEBHOOK_TWITCH_PRIME_CONFIG');
