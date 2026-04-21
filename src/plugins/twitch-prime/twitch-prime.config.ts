import { z } from 'zod';

export const TwitchPrimeConfigSchema = z.object({
  TWITCH_CLIENT_ID: z.string().min(1),
  TWITCH_CLIENT_SECRET: z.string().min(1),
  TWITCH_PRIME_REDIRECT_URI: z.url(),
  TWITCH_PRIME_CHANNEL: z.string().optional(),
  DISCORD_TWITCH_PRIME_WEBHOOK_URL: z.url(),
});

export type TwitchPrimeConfig = z.infer<typeof TwitchPrimeConfigSchema>;

export const TWITCH_PRIME_CONFIG = Symbol('TWITCH_PRIME_CONFIG');
