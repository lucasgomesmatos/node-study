import 'dotenv/config'

import { Knex, knex as setupKnex } from 'knex'
import { environment } from './env'

export const knexConfig: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: environment.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const database = setupKnex(knexConfig)
