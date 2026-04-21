import { z } from 'zod';

export const DiscordDealsConfigSchema = z.object({
  DISCORD_DEALS_WEBHOOK_URL: z.url(),
  DISCORD_DEALS_EPIC_THREAD_ID: z.string().optional(),
  DISCORD_DEALS_ITAD_THREAD_ID: z.string().optional(),
  DISCORD_DEALS_PRIME_THREAD_ID: z.string().optional(),
});

export type DiscordDealsConfig = z.infer<typeof DiscordDealsConfigSchema>;

export const DISCORD_DEALS_CONFIG = Symbol('DISCORD_DEALS_CONFIG');

export const DiscordTwitchPrimeConfigSchema = z.object({
  DISCORD_TWITCH_PRIME_WEBHOOK_URL: z.url(),
  DISCORD_TWITCH_PRIME_THREAD_ID: z.string().optional(),
});

export type DiscordTwitchPrimeConfig = z.infer<typeof DiscordTwitchPrimeConfigSchema>;

export const DISCORD_TWITCH_PRIME_CONFIG = Symbol('DISCORD_TWITCH_PRIME_CONFIG');
