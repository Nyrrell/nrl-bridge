import { z } from 'zod';

const SmtpSchema = z.object({
  MAIL_SMTP_HOST: z.string().min(1),
  MAIL_SMTP_PORT: z.coerce.number().int().positive().default(587),
  MAIL_SMTP_SECURE: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .default(false),
  MAIL_SMTP_USER: z.string().min(1).optional(),
  MAIL_SMTP_PASS: z.string().min(1).optional(),
  MAIL_FROM: z.email(),
  // Global default recipient. Setting it activates mail for every source;
  // a per-source MAIL_<SOURCE>_TO overrides the recipient for that source.
  MAIL_TO: z.string().min(1).optional(),
});

export const MailDealsConfigSchema = SmtpSchema.extend({
  MAIL_DEALS_TO: z.string().min(1).optional(),
}).refine((c) => Boolean(c.MAIL_DEALS_TO || c.MAIL_TO), {
  message: 'MAIL_DEALS_TO or MAIL_TO must be set',
});

export type MailDealsConfig = z.infer<typeof MailDealsConfigSchema>;

export const MAIL_DEALS_CONFIG = Symbol('MAIL_DEALS_CONFIG');

export const MailTwitchPrimeConfigSchema = SmtpSchema.extend({
  MAIL_TWITCH_PRIME_TO: z.string().min(1).optional(),
}).refine((c) => Boolean(c.MAIL_TWITCH_PRIME_TO || c.MAIL_TO), {
  message: 'MAIL_TWITCH_PRIME_TO or MAIL_TO must be set',
});

export type MailTwitchPrimeConfig = z.infer<typeof MailTwitchPrimeConfigSchema>;

export const MAIL_TWITCH_PRIME_CONFIG = Symbol('MAIL_TWITCH_PRIME_CONFIG');

export type SmtpConfig = z.infer<typeof SmtpSchema>;