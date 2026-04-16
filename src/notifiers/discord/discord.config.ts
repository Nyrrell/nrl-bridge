import { z } from 'zod';

export const DiscordDealsConfigSchema = z.object({
  DISCORD_DEALS_WEBHOOK_URL: z.url(),
  DISCORD_DEALS_EPIC_THREAD_ID: z.string().optional(),
  DISCORD_DEALS_ITAD_THREAD_ID: z.string().optional(),
  DISCORD_DEALS_PRIME_THREAD_ID: z.string().optional(),
});

export type DiscordDealsConfig = z.infer<typeof DiscordDealsConfigSchema>;

export const DISCORD_DEALS_CONFIG = Symbol('DISCORD_DEALS_CONFIG');
