import 'dotenv/config'

import { Knex, knex as setupKnex } from 'knex'
import { environment } from './env'

const CONNECTION_DATABASE_SQLITE = {
  filename: environment.DATABASE_URL,
}

const CONNECTION_DATABASE_URL =
  environment.DATABASE_CLIENT === 'pg'
    ? environment.DATABASE_URL
    : CONNECTION_DATABASE_SQLITE

export const knexConfig: Knex.Config = {
  client: environment.DATABASE_CLIENT,
  connection: CONNECTION_DATABASE_URL,

  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const database = setupKnex(knexConfig)
