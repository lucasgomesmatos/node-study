import { config } from 'dotenv'
import { z } from 'zod'

console.log(process.env.NODE_ENV)

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: true })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_CLIENT: z.enum(['pg', 'sqlite3']).default('pg'),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  console.error('Invalid environment variables', env.error.format())
  throw new Error('Invalid environment variables.')
}

export const environment = env.data
