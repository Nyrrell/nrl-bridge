import { z } from 'zod';

export const ItadConfigSchema = z.object({
  ITAD_API_KEY: z.string().min(1),
});

export type ItadConfig = z.infer<typeof ItadConfigSchema>;

export const ITAD_CONFIG = Symbol('ITAD_CONFIG');
