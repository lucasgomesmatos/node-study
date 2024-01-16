import fastify from 'fastify'
import uuid from 'node:crypto'
import { database } from './database'

const app = fastify()

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

app.get('/', async (request, reply) => {
  const transactions = await database('transactions')
    .where('amount', '>', 100)
    .select('*')

  return transactions
})

app
  .listen({
    port: 3000,
  })
  .then((address) => {
    console.log(`server listening on ${address}`)
  })
