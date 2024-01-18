import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { database } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const transactions = await database('transactions')
      .where('session_id', sessionId)
      .select('*')

    return reply.status(200).send(transactions)
  })

  app.get('/:id', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const getTransactionParamsSchema = z.object({ id: z.string().uuid() })
    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await database('transactions')
      .where({
        session_id: sessionId,
        id,
      })
      .first()

    if (!transaction) return reply.status(404).send()

    return reply.status(200).send(transaction)
  })

  app.get('/summary', async (request, reply) => {
    const sessionId = request.cookies.sessionId
    const summary = await database('transactions')
      .where({
        session_id: sessionId,
      })
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

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await database('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
