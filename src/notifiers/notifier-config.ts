import type { Logger } from '@nestjs/common';
import type { ZodType } from 'zod';

export function resolveNotifierConfig<T>(
  schema: ZodType<T>,
  triggerKeys: string[],
  label: string,
  logger: Logger,
): T | undefined {
  const intended = triggerKeys.some((key) => {
    const value = process.env[key];
    return typeof value === 'string' && value.trim() !== '';
  });

  if (!intended) {
    logger.log(`${label} notifier inactive (no config set)`);
    return undefined;
  }

  const result = schema.safeParse(process.env);
  if (result.success) {
    return result.data;
  }

  const details = result.error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('; ');
  throw new Error(
    `${label} notifier is partially configured and cannot start: ${details}`,
  );
}