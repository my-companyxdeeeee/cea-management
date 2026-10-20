import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_MIGRATOR_URL: z.string().url().optional(),
  DATABASE_RUNTIME_USER: z.string().regex(/^[a-z_][a-z0-9_]{0,62}$/).default('cea_app'),
  DATABASE_RUNTIME_PASSWORD: z.string().min(1).default('change_me'),
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),
  PORT: z.coerce.number().int().positive().default(3000)
});
export const env = schema.parse(process.env);
