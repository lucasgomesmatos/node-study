import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3000),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  console.error('Invalid environment variables', env.error.format())
  throw new Error('Invalid environment variables.')
}

export const environment = env.data
