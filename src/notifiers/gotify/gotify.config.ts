import { z } from 'zod';

export const GotifyDealsConfigSchema = z
  .object({
    GOTIFY_URL: z.url(),
    GOTIFY_EPIC_TOKEN: z.string().min(1).optional(),
    GOTIFY_ITAD_TOKEN: z.string().min(1).optional(),
    GOTIFY_PRIME_TOKEN: z.string().min(1).optional(),
    GOTIFY_DEALS_PRIORITY: z.coerce.number().int().min(0).max(10).default(5),
  })
  .refine(
    (c) => Boolean(c.GOTIFY_EPIC_TOKEN || c.GOTIFY_ITAD_TOKEN || c.GOTIFY_PRIME_TOKEN),
    {
      message:
        'At least one of GOTIFY_EPIC_TOKEN, GOTIFY_ITAD_TOKEN, GOTIFY_PRIME_TOKEN must be set',
    },
  );

export type GotifyDealsConfig = z.infer<typeof GotifyDealsConfigSchema>;

export const GOTIFY_DEALS_CONFIG = Symbol('GOTIFY_DEALS_CONFIG');

export const GotifyTwitchPrimeConfigSchema = z.object({
  GOTIFY_URL: z.url(),
  GOTIFY_TWITCH_PRIME_TOKEN: z.string().min(1),
  GOTIFY_TWITCH_PRIME_PRIORITY: z.coerce.number().int().min(0).max(10).default(5),
});

export type GotifyTwitchPrimeConfig = z.infer<typeof GotifyTwitchPrimeConfigSchema>;

export const GOTIFY_TWITCH_PRIME_CONFIG = Symbol('GOTIFY_TWITCH_PRIME_CONFIG');