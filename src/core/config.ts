import { z } from 'zod';

const AppConfigSchema = z.object({
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_PATH: z.string().min(1).default('bridge.db'),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export function loadAppConfig(): AppConfig {
  const result = AppConfigSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `[AppConfig] Invalid configuration:\n${JSON.stringify(z.treeifyError(result.error), null, 2)}`,
    );
  }
  return result.data;
}

export const APP_CONFIG = Symbol('APP_CONFIG');

export function isPluginDisabled(name: string): boolean {
  return (
    process.env['DISABLED_PLUGINS']
      ?.split(',')
      .map((s) => s.trim())
      .includes(name) ?? false
  );
}
