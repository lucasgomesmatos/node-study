import fastify from 'fastify'
import uuid from 'node:crypto'
import { database } from './database'
import { environment } from './env'
import { transactionsRoutes } from './routes/transactions'

const app = fastify()

app.register(transactionsRoutes, {
  prefix: '/transactions',
})

app.post('/', async () => {
  const transaction = await database('transactions')
    .insert({
      id: uuid.randomUUID(),
      title: 'Transação de teste',
      amount: 1000,
    })
    .returning('*')

  return transaction
})

app
  .listen({
    port: environment.PORT,
  })
  .then((address) => {
    console.log(`server listening on ${address}`)
  })
