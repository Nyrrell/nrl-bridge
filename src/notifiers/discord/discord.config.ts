import { z } from 'zod';

export const DiscordDealsConfigSchema = z.object({
  DISCORD_DEALS_WEBHOOK_URL: z.url(),
});

export type DiscordDealsConfig = z.infer<typeof DiscordDealsConfigSchema>;

export const DISCORD_DEALS_CONFIG = Symbol('DISCORD_DEALS_CONFIG');
