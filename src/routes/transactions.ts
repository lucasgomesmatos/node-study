import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { database } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async (_, reply) => {
    const transactions = await database('transactions').select('*')

    return reply.status(200).send(transactions)
  })

  app.get('/:id', async (request, reply) => {
    const getTransactionParamsSchema = z.object({ id: z.string().uuid() })
    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await database('transactions').where({ id }).first()

    if (!transaction) return reply.status(404).send()

    return reply.status(200).send(transaction)
  })

  app.get('/summary', async (_, reply) => {
    const summary = await database('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return reply.status(200).send(summary)
  })

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await database('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })
}
